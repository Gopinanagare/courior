import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ awb: string }> }
) {
  try {
    const { awb } = await params;
    if (!awb) {
      return NextResponse.json(
        { success: false, message: "AWB number is required." },
        { status: 400 }
      );
    }

    const cleanAwb = awb.trim().toUpperCase();

    // 1. Fetch Shipment
    const shipment = db.prepare(`
      SELECT 
        s.*,
        ob.name as origin_hub_name, ob.code as origin_hub_code, ob.city as origin_hub_city,
        db.name as dest_hub_name, db.code as dest_hub_code, db.city as dest_hub_city,
        cb.name as current_hub_name, cb.code as current_hub_code, cb.city as current_hub_city
      FROM shipments s
      LEFT JOIN branches ob ON s.origin_hub_id = ob.id
      LEFT JOIN branches db ON s.destination_hub_id = db.id
      LEFT JOIN branches cb ON s.current_hub_id = cb.id
      WHERE UPPER(s.awb_number) = ?
    `).get(cleanAwb) as any;

    if (!shipment) {
      return NextResponse.json(
        { success: false, message: `Consignment with AWB '${cleanAwb}' was not found in the verified ledger.` },
        { status: 404 }
      );
    }

    // 2. Fetch Tracking Events in chronological order (or reverse for timeline)
    const events = db.prepare(`
      SELECT * FROM tracking_events 
      WHERE UPPER(awb_number) = ? 
      ORDER BY event_time DESC, id DESC
    `).all(cleanAwb);

    // 3. Status progress mapping
    const statusOrder = [
      "booked",
      "pickup_scheduled",
      "picked_up",
      "origin_hub",
      "in_transit",
      "destination_hub",
      "out_for_delivery",
      "delivered",
    ];

    let currentStepIndex = statusOrder.indexOf(shipment.status);
    if (shipment.status === "failed" || shipment.status === "returned" || shipment.status === "cancelled") {
      currentStepIndex = -1;
    }

    // Public sanitized shipment data (protecting internal staff notes if not admin)
    return NextResponse.json({
      success: true,
      data: {
        awb: shipment.awb_number,
        status: shipment.status,
        serviceName: shipment.service_name,
        serviceCode: shipment.service_code,
        cargoCategory: shipment.cargo_category,
        packageType: shipment.package_type,
        piecesCount: shipment.pieces_count,
        actualWeightKg: shipment.actual_weight_kg,
        chargeableWeightKg: shipment.chargeable_weight_kg,
        declaredValue: shipment.declared_value,
        
        // Sender / Origin info
        senderName: shipment.sender_name,
        senderCompany: shipment.sender_company,
        senderCity: shipment.sender_city,
        senderState: shipment.sender_state,
        senderPincode: shipment.sender_pincode,
        originHub: {
          code: shipment.origin_hub_code,
          name: shipment.origin_hub_name,
          city: shipment.origin_hub_city,
        },
        
        // Recipient / Destination info
        recipientName: shipment.recipient_name,
        recipientCompany: shipment.recipient_company,
        recipientCity: shipment.recipient_city,
        recipientState: shipment.recipient_state,
        recipientPincode: shipment.recipient_pincode,
        destHub: {
          code: shipment.dest_hub_code,
          name: shipment.dest_hub_name,
          city: shipment.dest_hub_city,
        },
        
        // Staging & Vehicle
        currentHub: {
          code: shipment.current_hub_code,
          name: shipment.current_hub_name,
          city: shipment.current_hub_city,
        },
        dockGate: shipment.dock_gate,
        pickupSlot: shipment.pickup_slot,
        pickupDate: shipment.pickup_date,
        
        // POD
        podRecipientName: shipment.pod_recipient_name,
        podSignatureUrl: shipment.pod_signature_url,
        podDeliveredAt: shipment.pod_delivered_at,
        podPhotoUrl: shipment.pod_photo_url,

        // Timeline events
        events,
        currentStepIndex,
        createdAt: shipment.created_at,
        updatedAt: shipment.updated_at,
      },
    });
  } catch (error: any) {
    console.error("Tracking API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve tracking details." },
      { status: 500 }
    );
  }
}
