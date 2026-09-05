import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth, logAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["super_admin", "operations", "support"]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    let sql = `
      SELECT e.*, u.name as assigned_to_name
      FROM enquiries e
      LEFT JOIN users u ON e.assigned_to_user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== "all") {
      sql += " AND e.status = ?";
      params.push(status);
    }

    if (priority && priority !== "all") {
      sql += " AND e.priority = ?";
      params.push(priority);
    }

    sql += " ORDER BY CASE WHEN e.status = 'open' THEN 1 WHEN e.status = 'in_progress' THEN 2 ELSE 3 END, e.created_at DESC";

    const enquiries = db.prepare(sql).all(...params);
    return NextResponse.json({ success: true, data: enquiries });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, errorResponse } = requireAuth(req, ["super_admin", "operations", "support"]);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { id, status, priority, response_notes, assigned_to_user_id } = body;

    const existing = db.prepare("SELECT * FROM enquiries WHERE id = ?").get(id) as any;
    if (!existing) {
      return NextResponse.json({ success: false, message: "Enquiry not found." }, { status: 404 });
    }

    db.prepare(`
      UPDATE enquiries SET
        status = ?,
        priority = ?,
        response_notes = ?,
        assigned_to_user_id = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      status || existing.status,
      priority || existing.priority,
      response_notes !== undefined ? response_notes : existing.response_notes,
      assigned_to_user_id || existing.assigned_to_user_id || user?.id,
      id
    );

    logAudit(
      user?.id || null,
      user?.name || "Support",
      user?.role || "support",
      "UPDATE_ENQUIRY",
      "ENQUIRY",
      existing.ticket_number,
      `Support ticket ${existing.ticket_number} updated to '${status}'. Response notes: ${response_notes || "None"}`
    );

    return NextResponse.json({ success: true, message: `Ticket ${existing.ticket_number} updated.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
