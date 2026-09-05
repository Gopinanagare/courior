import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth, logAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ awb: string }> }
) {
  try {
    const { user, errorResponse } = requireAuth(req, ["super_admin", "operations", "branch_manager"]);
    if (errorResponse) return errorResponse;

    const { awb } = await params;
    const cleanAwb = awb.trim().toUpperCase();
    const body = await req.json();

    const {
      status, // 'picked_up', 'origin_hub', 'in_transit', 'destination_hub', 'out_for_delivery', 'delivered', 'failed', 'returned', 'cancelled'
      title,
      description,
      facility_name,
      facility_code,
      location_city,
      dock_gate,
      container_seal,
      weight_at_gate,
      event_time,
    } = body;

    if (!status || !title || !description || !location_city) {
      return NextResponse.json(
        { success: false, message: "Status, Title, Description, and Location City are required." },
        { status: 400 }
      );
    }

    const shipment = db.prepare("SELECT * FROM shipments WHERE UPPER(awb_number) = ?").get(cleanAwb) as any;
    if (!shipment) {
      return NextResponse.json({ success: false, message: "Shipment not found." }, { status: 404 });
    }

    const effectiveEventTime = event_time || new Date().toISOString().replace("T", " ").substring(0, 19);

    // Insert tracking milestone
    const stmt = db.prepare(`
      INSERT INTO tracking_events (
        shipment_id, awb_number, status, title, description,
        facility_name, facility_code, location_city, dock_gate,
        container_seal, weight_at_gate, created_by_user_id, event_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      shipment.id,
      cleanAwb,
      status,
      title.trim(),
      description.trim(),
      facility_name ? facility_name.trim() : "Operational Hub",
      facility_code ? facility_code.trim() : null,
      location_city.trim(),
      dock_gate ? dock_gate.trim() : null,
      container_seal ? container_seal.trim() : null,
      weight_at_gate ? Number(weight_at_gate) : shipment.actual_weight_kg,
      user?.id,
      effectiveEventTime
    );

    // Update shipment current status
    db.prepare(`
      UPDATE shipments SET 
        status = ?, 
        dock_gate = COALESCE(?, dock_gate),
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(status, dock_gate || null, shipment.id);

    // Dispatch notification
    const recipientContact = shipment.sender_phone || shipment.recipient_phone;
    if (recipientContact) {
      db.prepare(`
        INSERT INTO notification_logs (shipment_id, awb_number, recipient_contact, channel, event_type, message_payload, status)
        VALUES (?, ?, ?, 'sms', ?, ?, 'sent')
      `).run(
        shipment.id,
        cleanAwb,
        recipientContact,
        status,
        `Exolent Express Alert: Shipment ${cleanAwb} is now '${status.replace(/_/g, " ").toUpperCase()}'. Milestone: ${title} at ${location_city}.`
      );
    }

    logAudit(
      user?.id || null,
      user?.name || "Admin",
      user?.role || "super_admin",
      "ADD_TRACKING_EVENT",
      "TRACKING",
      cleanAwb,
      `Scan logged: ${title} (${status}) at ${facility_name || location_city}. Seal: ${container_seal || "N/A"}`
    );

    return NextResponse.json({
      success: true,
      message: `Tracking milestone registered for AWB ${cleanAwb}.`,
    });
  } catch (error: any) {
    console.error("Tracking event error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
