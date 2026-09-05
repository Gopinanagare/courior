import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["super_admin", "operations", "accounts"]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("type") || "overview"; // 'volume', 'revenue', 'delivery', 'hub_velocity'

    // Status breakdown
    const statusCounts = db.prepare(`
      SELECT status, count(*) as count, SUM(total_amount) as revenue
      FROM shipments
      GROUP BY status
    `).all();

    // Service breakdown
    const serviceCounts = db.prepare(`
      SELECT service_name, count(*) as count, SUM(total_amount) as revenue, SUM(chargeable_weight_kg) as total_weight
      FROM shipments
      GROUP BY service_name
    `).all();

    // Hub performance
    const hubPerformance = db.prepare(`
      SELECT 
        b.code, b.name, b.city,
        (SELECT count(*) FROM shipments WHERE origin_hub_id = b.id) as outbound_count,
        (SELECT count(*) FROM shipments WHERE destination_hub_id = b.id) as inbound_count,
        (SELECT count(*) FROM shipments WHERE current_hub_id = b.id AND status = 'in_transit') as staged_count
      FROM branches b
    `).all();

    // Payment breakdown
    const paymentBreakdown = db.prepare(`
      SELECT payment_mode, count(*) as count, SUM(total_amount) as total_freight, SUM(cod_amount) as total_cod
      FROM shipments
      GROUP BY payment_mode
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        statusCounts,
        serviceCounts,
        hubPerformance,
        paymentBreakdown,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
