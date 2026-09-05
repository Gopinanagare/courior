import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query = searchParams.get("q")?.trim();

    let sql = `
      SELECT 
        s.*,
        ob.name as origin_hub_name, ob.code as origin_hub_code,
        db.name as dest_hub_name, db.code as dest_hub_code
      FROM shipments s
      LEFT JOIN branches ob ON s.origin_hub_id = ob.id
      LEFT JOIN branches db ON s.destination_hub_id = db.id
      WHERE (s.user_id = ? OR s.sender_phone = ? OR s.sender_email = ?)
    `;
    const params: any[] = [session.id, session.phone || "", session.email || ""];

    if (status && status !== "all") {
      sql += " AND s.status = ?";
      params.push(status);
    }

    if (query) {
      sql += " AND (s.awb_number LIKE ? OR s.recipient_name LIKE ? OR s.recipient_city LIKE ?)";
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    sql += " ORDER BY s.created_at DESC";

    const shipments = db.prepare(sql).all(...params);

    return NextResponse.json({
      success: true,
      data: shipments,
    });
  } catch (error: any) {
    console.error("Customer shipments error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load shipments." },
      { status: 500 }
    );
  }
}
