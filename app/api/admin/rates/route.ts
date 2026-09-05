import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth, logAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["super_admin", "operations", "accounts"]);
    if (errorResponse) return errorResponse;

    const services = db.prepare("SELECT * FROM courier_services ORDER BY id ASC").all();
    const rules = db.prepare("SELECT * FROM rate_rules ORDER BY id DESC LIMIT 1").get() as any;

    return NextResponse.json({
      success: true,
      data: {
        services,
        rules,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, errorResponse } = requireAuth(req, ["super_admin", "accounts"]);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { type } = body; // 'rules' or 'service'

    if (type === "rules") {
      const { fuel_surcharge_pct, insurance_pct, min_insurance_fee, gst_pct, cod_fixed_fee, cod_pct } = body.rules;
      db.prepare(`
        UPDATE rate_rules SET
          fuel_surcharge_pct = ?,
          insurance_pct = ?,
          min_insurance_fee = ?,
          gst_pct = ?,
          cod_fixed_fee = ?,
          cod_pct = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = (SELECT id FROM rate_rules ORDER BY id DESC LIMIT 1)
      `).run(fuel_surcharge_pct, insurance_pct, min_insurance_fee, gst_pct, cod_fixed_fee, cod_pct);

      logAudit(
        user?.id || null,
        user?.name || "Admin",
        user?.role || "super_admin",
        "UPDATE_RATE_RULES",
        "RATE_RULES",
        "GLOBAL",
        `Updated rate rules: FSC=${fuel_surcharge_pct}%, GST=${gst_pct}%, Insurance=${insurance_pct}%`
      );

      return NextResponse.json({ success: true, message: "Rate rules updated successfully." });
    }

    if (type === "service") {
      const { id, name, transit_time_label, base_rate, per_kg_rate, volumetric_divisor, min_weight_kg, is_active } = body.service;
      db.prepare(`
        UPDATE courier_services SET
          name = ?,
          transit_time_label = ?,
          base_rate = ?,
          per_kg_rate = ?,
          volumetric_divisor = ?,
          min_weight_kg = ?,
          is_active = ?
        WHERE id = ?
      `).run(name, transit_time_label, base_rate, per_kg_rate, volumetric_divisor, min_weight_kg, is_active ? 1 : 0, id);

      logAudit(
        user?.id || null,
        user?.name || "Admin",
        user?.role || "super_admin",
        "UPDATE_SERVICE_RATE",
        "SERVICE",
        String(id),
        `Updated service ${name} (Base: ₹${base_rate}, Per KG: ₹${per_kg_rate})`
      );

      return NextResponse.json({ success: true, message: "Service tariff updated successfully." });
    }

    return NextResponse.json({ success: false, message: "Invalid update type." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
