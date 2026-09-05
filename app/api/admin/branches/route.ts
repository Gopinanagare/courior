import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth, logAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["super_admin", "operations", "branch_manager", "support", "accounts"]);
    if (errorResponse) return errorResponse;

    const branches = db.prepare(`
      SELECT b.*, 
        (SELECT count(*) FROM shipments WHERE origin_hub_id = b.id OR destination_hub_id = b.id) as total_shipments_handled,
        (SELECT count(*) FROM users WHERE branch_id = b.id) as staff_count
      FROM branches b
      ORDER BY b.city ASC
    `).all();

    return NextResponse.json({ success: true, data: branches });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = requireAuth(req, ["super_admin", "operations"]);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { code, name, city, state, pincode, address, dock_gates = 8, contact_name, contact_phone, is_active = 1 } = body;

    if (!code || !name || !city || !pincode || !address || !contact_name || !contact_phone) {
      return NextResponse.json({ success: false, message: "All branch fields are required." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const stmt = db.prepare(`
      INSERT INTO branches (code, name, city, state, pincode, address, dock_gates, contact_name, contact_phone, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(cleanCode, name.trim(), city.trim(), state.trim(), pincode.trim(), address.trim(), Number(dock_gates), contact_name.trim(), contact_phone.trim(), is_active ? 1 : 0);

    logAudit(
      user?.id || null,
      user?.name || "Admin",
      user?.role || "super_admin",
      "CREATE_BRANCH",
      "BRANCH",
      cleanCode,
      `New Hub created: ${cleanCode} - ${name} in ${city}.`
    );

    return NextResponse.json({ success: true, message: `Hub ${cleanCode} created successfully.`, data: { id: result.lastInsertRowid } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, errorResponse } = requireAuth(req, ["super_admin", "operations"]);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { id, code, name, city, state, pincode, address, dock_gates, contact_name, contact_phone, is_active } = body;

    db.prepare(`
      UPDATE branches SET
        code = ?, name = ?, city = ?, state = ?, pincode = ?,
        address = ?, dock_gates = ?, contact_name = ?, contact_phone = ?, is_active = ?
      WHERE id = ?
    `).run(code.trim().toUpperCase(), name.trim(), city.trim(), state.trim(), pincode.trim(), address.trim(), Number(dock_gates), contact_name.trim(), contact_phone.trim(), is_active ? 1 : 0, id);

    logAudit(
      user?.id || null,
      user?.name || "Admin",
      user?.role || "super_admin",
      "UPDATE_BRANCH",
      "BRANCH",
      code,
      `Updated Hub ${code} details.`
    );

    return NextResponse.json({ success: true, message: `Hub ${code} updated successfully.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
