import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth, logAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ awb: string }> }
) {
  try {
    const { user, errorResponse } = requireAuth(req, ["super_admin", "operations", "branch_manager", "support", "accounts"]);
    if (errorResponse) return errorResponse;

    const { awb } = await params;
    const cleanAwb = awb.trim().toUpperCase();

    const shipment = db.prepare(`
      SELECT 
        s.*,
        ob.name as origin_hub_name, ob.code as origin_hub_code, ob.city as origin_hub_city,
        db.name as dest_hub_name, db.code as dest_hub_code, db.city as dest_hub_city,
        cb.name as current_hub_name, cb.code as current_hub_code, cb.city as current_hub_city,
        u.name as customer_name, u.email as customer_email, u.phone as customer_phone
      FROM shipments s
      LEFT JOIN branches ob ON s.origin_hub_id = ob.id
      LEFT JOIN branches db ON s.destination_hub_id = db.id
      LEFT JOIN branches cb ON s.current_hub_id = cb.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE UPPER(s.awb_number) = ?
    `).get(cleanAwb) as any;

    if (!shipment) {
      return NextResponse.json({ success: false, message: "Shipment not found." }, { status: 404 });
    }

    const events = db.prepare(`
      SELECT te.*, u.name as scanned_by_name
      FROM tracking_events te
      LEFT JOIN users u ON te.created_by_user_id = u.id
      WHERE UPPER(te.awb_number) = ?
      ORDER BY te.event_time DESC, te.id DESC
    `).all(cleanAwb);

    const invoice = db.prepare("SELECT * FROM invoices WHERE UPPER(awb_number) = ?").get(cleanAwb);
    const notifications = db.prepare("SELECT * FROM notification_logs WHERE UPPER(awb_number) = ? ORDER BY sent_at DESC").all(cleanAwb);

    return NextResponse.json({
      success: true,
      data: {
        shipment,
        events,
        invoice,
        notifications,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ awb: string }> }
) {
  try {
    const { user, errorResponse } = requireAuth(req, ["super_admin", "operations", "branch_manager"]);
    if (errorResponse) return errorResponse;

    const { awb } = await params;
    const cleanAwb = awb.trim().toUpperCase();
    const body = await req.json();

    const existing = db.prepare("SELECT * FROM shipments WHERE UPPER(awb_number) = ?").get(cleanAwb) as any;
    if (!existing) {
      return NextResponse.json({ success: false, message: "Shipment not found." }, { status: 404 });
    }

    const {
      sender_name = existing.sender_name,
      sender_phone = existing.sender_phone,
      sender_email = existing.sender_email,
      sender_company = existing.sender_company,
      sender_address = existing.sender_address,
      sender_landmark = existing.sender_landmark,
      sender_city = existing.sender_city,
      sender_state = existing.sender_state,
      sender_pincode = existing.sender_pincode,

      recipient_name = existing.recipient_name,
      recipient_phone = existing.recipient_phone,
      recipient_email = existing.recipient_email,
      recipient_company = existing.recipient_company,
      recipient_address = existing.recipient_address,
      recipient_landmark = existing.recipient_landmark,
      recipient_city = existing.recipient_city,
      recipient_state = existing.recipient_state,
      recipient_pincode = existing.recipient_pincode,

      status = existing.status,
      current_hub_id = existing.current_hub_id,
      assigned_driver = existing.assigned_driver,
      assigned_vehicle = existing.assigned_vehicle,
      dock_gate = existing.dock_gate,
      pickup_slot = existing.pickup_slot,
      cod_status = existing.cod_status,
      internal_notes = existing.internal_notes,
    } = body;

    const stmt = db.prepare(`
      UPDATE shipments SET
        sender_name = ?, sender_phone = ?, sender_email = ?, sender_company = ?,
        sender_address = ?, sender_landmark = ?, sender_city = ?, sender_state = ?, sender_pincode = ?,
        recipient_name = ?, recipient_phone = ?, recipient_email = ?, recipient_company = ?,
        recipient_address = ?, recipient_landmark = ?, recipient_city = ?, recipient_state = ?, recipient_pincode = ?,
        status = ?, current_hub_id = ?, assigned_driver = ?, assigned_vehicle = ?, dock_gate = ?, pickup_slot = ?,
        cod_status = ?, internal_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      sender_name, sender_phone, sender_email, sender_company,
      sender_address, sender_landmark, sender_city, sender_state, sender_pincode,
      recipient_name, recipient_phone, recipient_email, recipient_company,
      recipient_address, recipient_landmark, recipient_city, recipient_state, recipient_pincode,
      status, current_hub_id, assigned_driver, assigned_vehicle, dock_gate, pickup_slot,
      cod_status, internal_notes, existing.id
    );

    logAudit(
      user?.id || null,
      user?.name || "Admin",
      user?.role || "super_admin",
      "UPDATE_SHIPMENT",
      "SHIPMENT",
      cleanAwb,
      `Updated shipment ${cleanAwb} (Status: ${status}, Driver: ${assigned_driver || "None"}, Hub: ${current_hub_id})`
    );

    return NextResponse.json({
      success: true,
      message: `Shipment ${cleanAwb} updated successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ awb: string }> }
) {
  try {
    const { user, errorResponse } = requireAuth(req, ["super_admin"]);
    if (errorResponse) return errorResponse;

    const { awb } = await params;
    const cleanAwb = awb.trim().toUpperCase();

    const shipment = db.prepare("SELECT id FROM shipments WHERE UPPER(awb_number) = ?").get(cleanAwb) as any;
    if (!shipment) {
      return NextResponse.json({ success: false, message: "Shipment not found." }, { status: 404 });
    }

    db.prepare("DELETE FROM tracking_events WHERE shipment_id = ?").run(shipment.id);
    db.prepare("DELETE FROM invoices WHERE shipment_id = ?").run(shipment.id);
    db.prepare("DELETE FROM notification_logs WHERE shipment_id = ?").run(shipment.id);
    db.prepare("DELETE FROM shipments WHERE id = ?").run(shipment.id);

    logAudit(
      user?.id || null,
      user?.name || "Admin",
      user?.role || "super_admin",
      "DELETE_SHIPMENT",
      "SHIPMENT",
      cleanAwb,
      `Deleted shipment ${cleanAwb} and related records.`
    );

    return NextResponse.json({
      success: true,
      message: `Shipment ${cleanAwb} deleted successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
