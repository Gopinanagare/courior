import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth, logAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["super_admin", "operations", "branch_manager", "support"]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();
    const zone = searchParams.get("zone");

    let sql = `
      SELECT p.*, b.name as hub_name, b.code as hub_code 
      FROM pincodes p
      LEFT JOIN branches b ON p.hub_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (zone && zone !== "all") {
      sql += " AND p.zone = ?";
      params.push(zone);
    }

    if (query) {
      sql += " AND (p.pincode LIKE ? OR p.city LIKE ? OR p.state LIKE ?)";
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    sql += " ORDER BY p.pincode ASC";
    const pincodes = db.prepare(sql).all(...params);

    return NextResponse.json({ success: true, data: pincodes });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = requireAuth(req, ["super_admin", "operations"]);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const {
      pincode,
      city,
      state,
      zone,
      hub_id,
      is_serviceable = 1,
      is_cod_allowed = 1,
      is_cold_chain_allowed = 1,
      delivery_days_std = 3,
      delivery_days_exp = 1,
    } = body;

    if (!pincode || !city || !state || !zone) {
      return NextResponse.json({ success: false, message: "Pincode, City, State, and Zone are required." }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO pincodes (pincode, city, state, zone, hub_id, is_serviceable, is_cod_allowed, is_cold_chain_allowed, delivery_days_std, delivery_days_exp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(pincode) DO UPDATE SET
        city = excluded.city,
        state = excluded.state,
        zone = excluded.zone,
        hub_id = excluded.hub_id,
        is_serviceable = excluded.is_serviceable,
        is_cod_allowed = excluded.is_cod_allowed,
        is_cold_chain_allowed = excluded.is_cold_chain_allowed,
        delivery_days_std = excluded.delivery_days_std,
        delivery_days_exp = excluded.delivery_days_exp
    `);

    stmt.run(
      pincode.trim(),
      city.trim(),
      state.trim(),
      zone.trim(),
      hub_id || 1,
      is_serviceable ? 1 : 0,
      is_cod_allowed ? 1 : 0,
      is_cold_chain_allowed ? 1 : 0,
      Number(delivery_days_std),
      Number(delivery_days_exp)
    );

    logAudit(
      user?.id || null,
      user?.name || "Admin",
      user?.role || "super_admin",
      "UPSERT_PINCODE",
      "PINCODE",
      pincode.trim(),
      `Pincode ${pincode} (${city}) configured with Hub ${hub_id}.`
    );

    return NextResponse.json({ success: true, message: `Pincode ${pincode} saved successfully.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, errorResponse } = requireAuth(req, ["super_admin"]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get("pincode");

    if (!pincode) {
      return NextResponse.json({ success: false, message: "Pincode required." }, { status: 400 });
    }

    db.prepare("DELETE FROM pincodes WHERE pincode = ?").run(pincode);

    logAudit(
      user?.id || null,
      user?.name || "Admin",
      user?.role || "super_admin",
      "DELETE_PINCODE",
      "PINCODE",
      pincode,
      `Pincode ${pincode} deleted from system.`
    );

    return NextResponse.json({ success: true, message: "Pincode deleted." });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
