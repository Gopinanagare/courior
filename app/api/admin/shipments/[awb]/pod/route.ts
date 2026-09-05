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
      pod_recipient_name,
      pod_signature_url,
      pod_photo_url,
      delivered_at,
      cod_collected = false,
      remarks = "Delivered in intact condition.",
    } = body;

    if (!pod_recipient_name) {
      return NextResponse.json(
        { success: false, message: "Recipient name is required for Proof of Delivery." },
        { status: 400 }
      );
    }

    const shipment = db.prepare("SELECT * FROM shipments WHERE UPPER(awb_number) = ?").get(cleanAwb) as any;
    if (!shipment) {
      return NextResponse.json({ success: false, message: "Shipment not found." }, { status: 404 });
    }

    const effectiveDeliveredAt = delivered_at || new Date().toISOString().replace("T", " ").substring(0, 19);

    const codStatus = shipment.payment_mode === "cod" ? (cod_collected ? "collected" : "pending") : "na";

    // Update shipment with POD details and status = delivered
    db.prepare(`
      UPDATE shipments SET
        status = 'delivered',
        pod_recipient_name = ?,
        pod_signature_url = ?,
        pod_photo_url = ?,
        pod_delivered_at = ?,
        cod_status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      pod_recipient_name.trim(),
      pod_signature_url || "https://placehold.co/400x150/png?text=Electronic+Signature+Captured",
      pod_photo_url || "https://placehold.co/600x400/png?text=Delivery+Dock+Proof+Photo",
      effectiveDeliveredAt,
      codStatus,
      shipment.id
    );

    // Insert Delivered Tracking Event
    db.prepare(`
      INSERT INTO tracking_events (
        shipment_id, awb_number, status, title, description,
        facility_name, location_city, dock_gate, created_by_user_id, event_time
      ) VALUES (?, ?, 'delivered', 'Consignment Successfully Delivered', ?, ?, ?, ?, ?)
    `).run(
      shipment.id,
      cleanAwb,
      `Delivered to ${pod_recipient_name}. ${remarks}`,
      "Consignee Receiving Point",
      shipment.recipient_city,
      shipment.dock_gate || "Main Gate",
      user?.id,
      effectiveDeliveredAt
    );

    // Notification
    const contact = shipment.sender_phone || shipment.recipient_phone;
    if (contact) {
      db.prepare(`
        INSERT INTO notification_logs (shipment_id, awb_number, recipient_contact, channel, event_type, message_payload, status)
        VALUES (?, ?, ?, 'whatsapp', 'delivered', ?, 'sent')
      `).run(
        shipment.id,
        cleanAwb,
        contact,
        `Exolent Express: Consignment ${cleanAwb} has been delivered successfully to ${pod_recipient_name} at ${shipment.recipient_city}. Thank you for choosing Exolent Express.`
      );
    }

    logAudit(
      user?.id || null,
      user?.name || "Admin",
      user?.role || "super_admin",
      "UPLOAD_POD",
      "SHIPMENT",
      cleanAwb,
      `POD uploaded for ${cleanAwb}. Received by: ${pod_recipient_name}. COD status: ${codStatus}`
    );

    return NextResponse.json({
      success: true,
      message: `Proof of Delivery uploaded and shipment ${cleanAwb} marked as Delivered.`,
    });
  } catch (error: any) {
    console.error("POD error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
