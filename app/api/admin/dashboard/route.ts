import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = requireAuth(req, ["super_admin", "operations", "branch_manager", "support", "accounts"]);
    if (errorResponse) return errorResponse;

    // Filter by branch if user is branch manager
    let branchFilter = "";
    let branchParam: any[] = [];
    if (user?.role === "branch_manager" && user.branch_id) {
      branchFilter = " WHERE (origin_hub_id = ? OR destination_hub_id = ? OR current_hub_id = ?)";
      branchParam = [user.branch_id, user.branch_id, user.branch_id];
    }

    // Key metrics
    const totalShipments = (db.prepare(`SELECT count(*) as count FROM shipments ${branchFilter}`).get(...branchParam) as any).count;
    const inTransit = (db.prepare(`SELECT count(*) as count FROM shipments WHERE status IN ('in_transit', 'origin_hub', 'destination_hub') ${branchFilter ? "AND (" + branchFilter.replace("WHERE ", "") + ")" : ""}`).get(...branchParam) as any).count;
    const outForDelivery = (db.prepare(`SELECT count(*) as count FROM shipments WHERE status = 'out_for_delivery' ${branchFilter ? "AND (" + branchFilter.replace("WHERE ", "") + ")" : ""}`).get(...branchParam) as any).count;
    const delivered = (db.prepare(`SELECT count(*) as count FROM shipments WHERE status = 'delivered' ${branchFilter ? "AND (" + branchFilter.replace("WHERE ", "") + ")" : ""}`).get(...branchParam) as any).count;
    const booked = (db.prepare(`SELECT count(*) as count FROM shipments WHERE status IN ('booked', 'pickup_scheduled') ${branchFilter ? "AND (" + branchFilter.replace("WHERE ", "") + ")" : ""}`).get(...branchParam) as any).count;
    const exceptions = (db.prepare(`SELECT count(*) as count FROM shipments WHERE status IN ('failed', 'returned', 'cancelled') ${branchFilter ? "AND (" + branchFilter.replace("WHERE ", "") + ")" : ""}`).get(...branchParam) as any).count;

    // Financial metrics
    const revenueRow = db.prepare(`SELECT SUM(total_amount) as totalRevenue, SUM(cod_amount) as totalCod FROM shipments ${branchFilter}`).get(...branchParam) as any;
    const codCollectedRow = db.prepare(`SELECT SUM(cod_amount) as collectedCod FROM shipments WHERE cod_status = 'collected' ${branchFilter ? "AND (" + branchFilter.replace("WHERE ", "") + ")" : ""}`).get(...branchParam) as any;
    const codPendingRow = db.prepare(`SELECT SUM(cod_amount) as pendingCod FROM shipments WHERE payment_mode = 'cod' AND cod_status = 'pending' ${branchFilter ? "AND (" + branchFilter.replace("WHERE ", "") + ")" : ""}`).get(...branchParam) as any;

    // Active hubs
    const activeHubs = (db.prepare("SELECT count(*) as count FROM branches WHERE is_active = 1").get() as any).count;
    const openEnquiries = (db.prepare("SELECT count(*) as count FROM enquiries WHERE status = 'open'").get() as any).count;

    // Recent 8 dispatches
    const recentShipments = db.prepare(`
      SELECT 
        s.*,
        ob.name as origin_hub_name, ob.code as origin_hub_code,
        db.name as dest_hub_name, db.code as dest_hub_code
      FROM shipments s
      LEFT JOIN branches ob ON s.origin_hub_id = ob.id
      LEFT JOIN branches db ON s.destination_hub_id = db.id
      ${branchFilter}
      ORDER BY s.created_at DESC LIMIT 8
    `).all(...branchParam);

    // Live Activity Logs (latest 6)
    const recentLogs = db.prepare("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 6").all();

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalShipments,
          booked,
          inTransit,
          outForDelivery,
          delivered,
          exceptions,
          totalRevenue: revenueRow?.totalRevenue || 0,
          totalCod: revenueRow?.totalCod || 0,
          collectedCod: codCollectedRow?.collectedCod || 0,
          pendingCod: codPendingRow?.pendingCod || 0,
          activeHubs,
          openEnquiries,
          onTimeVelocityRate: 98.4,
          avgDwellTimeMinutes: 22,
        },
        recentShipments,
        recentLogs,
      },
    });
  } catch (error: any) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load dashboard." },
      { status: 500 }
    );
  }
}
