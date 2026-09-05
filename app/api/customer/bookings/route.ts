import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession, logAudit } from "@/lib/auth";
import { calculateShippingRate, generateAwbNumber, generateInvoiceNumber } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  try {
    const session = getSession(req);
    const body = await req.json();

    const {
      // Sender / Pickup Full Address
      sender_name,
      sender_phone,
      sender_email,
      sender_company,
      sender_address,
      sender_landmark,
      sender_city,
      sender_state,
      sender_pincode,
      sender_gstin,

      // Recipient / Drop Full Address
      recipient_name,
      recipient_phone,
      recipient_email,
      recipient_company,
      recipient_address,
      recipient_landmark,
      recipient_city,
      recipient_state,
      recipient_pincode,

      // Package & Consignment
      service_code = "cargo",
      package_type = "carton",
      cargo_category = "General Cargo",
      pieces_count = 1,
      actual_weight_kg = 1,
      length_cm = 20,
      width_cm = 20,
      height_cm = 20,
      declared_value = 0,
      payment_mode = "prepaid",
      cod_amount = 0,
      pickup_date,
      pickup_slot = "14:00 - 16:30 IST",
      dock_gate = "Gate 1",
      internal_notes,
      save_sender_address = false,
      save_recipient_address = false,
    } = body;

    // Server-side validations
    if (!sender_name || !sender_phone || !sender_address || !sender_city || !sender_pincode) {
      return NextResponse.json(
        { success: false, message: "Complete Sender / Pickup address (Name, Phone, Address, City, Pincode) is required." },
        { status: 400 }
      );
    }

    if (!recipient_name || !recipient_phone || !recipient_address || !recipient_city || !recipient_pincode) {
      return NextResponse.json(
        { success: false, message: "Complete Recipient / Drop address (Name, Phone, Address, City, Pincode) is required." },
        { status: 400 }
      );
    }

    // Lookup service
    const service = db.prepare("SELECT * FROM courier_services WHERE code = ? AND is_active = 1").get(service_code) as any;
    if (!service) {
      return NextResponse.json(
        { success: false, message: `Courier service '${service_code}' is not available.` },
        { status: 400 }
      );
    }

    // Auto-map Hubs based on pincodes or default
    const originPin = db.prepare("SELECT hub_id FROM pincodes WHERE pincode = ?").get(sender_pincode) as any;
    const destPin = db.prepare("SELECT hub_id FROM pincodes WHERE pincode = ?").get(recipient_pincode) as any;

    const originHubId = originPin?.hub_id || 1; // Default to BLR hub
    const destHubId = destPin?.hub_id || 3;    // Default to BOM hub

    // Compute live rate
    const rate = calculateShippingRate({
      serviceCode: service_code,
      actualWeightKg: Number(actual_weight_kg),
      lengthCm: Number(length_cm),
      widthCm: Number(width_cm),
      heightCm: Number(height_cm),
      declaredValue: Number(declared_value),
      originPincode: sender_pincode,
      paymentMode: payment_mode as any,
      codAmount: Number(cod_amount),
    });

    // Generate unique AWB
    let awb_number = generateAwbNumber();
    while (db.prepare("SELECT id FROM shipments WHERE awb_number = ?").get(awb_number)) {
      awb_number = generateAwbNumber();
    }

    const userId = session ? session.id : null;
    const effectivePickupDate = pickup_date || new Date().toISOString().split("T")[0];

    // Insert Shipment
    const stmt = db.prepare(`
      INSERT INTO shipments (
        awb_number, user_id,
        sender_name, sender_phone, sender_email, sender_company, sender_address, sender_landmark, sender_city, sender_state, sender_pincode, sender_gstin,
        recipient_name, recipient_phone, recipient_email, recipient_company, recipient_address, recipient_landmark, recipient_city, recipient_state, recipient_pincode,
        service_id, service_code, service_name, package_type, cargo_category, pieces_count,
        actual_weight_kg, length_cm, width_cm, height_cm, volumetric_weight_kg, chargeable_weight_kg, declared_value,
        payment_mode, cod_amount, cod_status,
        base_freight, weight_surcharge, fuel_surcharge, insurance_fee, tax_gst, total_amount,
        origin_hub_id, destination_hub_id, current_hub_id, pickup_date, pickup_slot, dock_gate,
        status, internal_notes
      ) VALUES (
        ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?
      )
    `);

    const result = stmt.run(
      awb_number,
      userId,
      sender_name.trim(),
      sender_phone.trim(),
      sender_email ? sender_email.trim() : null,
      sender_company ? sender_company.trim() : null,
      sender_address.trim(),
      sender_landmark ? sender_landmark.trim() : null,
      sender_city.trim(),
      sender_state || "Karnataka",
      sender_pincode.trim(),
      sender_gstin ? sender_gstin.trim() : null,

      recipient_name.trim(),
      recipient_phone.trim(),
      recipient_email ? recipient_email.trim() : null,
      recipient_company ? recipient_company.trim() : null,
      recipient_address.trim(),
      recipient_landmark ? recipient_landmark.trim() : null,
      recipient_city.trim(),
      recipient_state || "Maharashtra",
      recipient_pincode.trim(),

      service.id,
      service.code,
      service.name,
      package_type,
      cargo_category,
      Number(pieces_count) || 1,

      rate.actualWeightKg,
      Number(length_cm),
      Number(width_cm),
      Number(height_cm),
      rate.volumetricWeightKg,
      rate.chargeableWeightKg,
      Number(declared_value) || 0,

      payment_mode,
      payment_mode === "cod" ? Number(cod_amount) : 0,
      payment_mode === "cod" ? "pending" : "na",

      rate.baseFreight,
      rate.weightSurcharge,
      rate.fuelSurcharge,
      rate.insuranceFee,
      rate.taxGst,
      rate.totalAmount,

      originHubId,
      destHubId,
      originHubId,
      effectivePickupDate,
      pickup_slot,
      dock_gate,

      "booked",
      internal_notes || null
    );

    const shipmentId = Number(result.lastInsertRowid);

    // Initial Tracking Event
    const originHub = db.prepare("SELECT name, code, city FROM branches WHERE id = ?").get(originHubId) as any;
    db.prepare(`
      INSERT INTO tracking_events (
        shipment_id, awb_number, status, title, description,
        facility_name, facility_code, location_city, dock_gate, weight_at_gate, created_by_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      shipmentId,
      awb_number,
      "booked",
      "Consignment Manifested & Dimension Verified",
      `Facility: ${originHub?.name || "Origin Hub"}. Booking logged for ${service.name}. Staged at ${dock_gate}.`,
      originHub?.name || "Origin Hub",
      originHub?.code || "BLR-WFD",
      sender_city,
      dock_gate,
      rate.actualWeightKg,
      userId
    );

    // Generate Invoice
    const invoiceNumber = generateInvoiceNumber();
    db.prepare(`
      INSERT INTO invoices (
        invoice_number, shipment_id, awb_number, user_id,
        subtotal, tax_amount, total_amount, payment_status, payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      invoiceNumber,
      shipmentId,
      awb_number,
      userId,
      rate.baseFreight + rate.weightSurcharge + rate.fuelSurcharge + rate.insuranceFee,
      rate.taxGst,
      rate.totalAmount,
      payment_mode === "prepaid" ? "paid" : "pending",
      payment_mode === "prepaid" ? "Online / Corporate Account" : payment_mode.toUpperCase()
    );

    // Save addresses if requested by user
    if (userId && save_sender_address) {
      db.prepare(`
        INSERT INTO saved_addresses (user_id, type, label, contact_name, phone, email, company_name, address, landmark, city, state, pincode, gstin)
        VALUES (?, 'sender', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        sender_company || sender_name,
        sender_name,
        sender_phone,
        sender_email || null,
        sender_company || null,
        sender_address,
        sender_landmark || null,
        sender_city,
        sender_state || "",
        sender_pincode,
        sender_gstin || null
      );
    }

    if (userId && save_recipient_address) {
      db.prepare(`
        INSERT INTO saved_addresses (user_id, type, label, contact_name, phone, email, company_name, address, landmark, city, state, pincode)
        VALUES (?, 'consignee', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        recipient_company || recipient_name,
        recipient_name,
        recipient_phone,
        recipient_email || null,
        recipient_company || null,
        recipient_address,
        recipient_landmark || null,
        recipient_city,
        recipient_state || "",
        recipient_pincode
      );
    }

    // Trigger Notification Log
    db.prepare(`
      INSERT INTO notification_logs (shipment_id, awb_number, recipient_contact, channel, event_type, message_payload, status)
      VALUES (?, ?, ?, 'whatsapp', 'booking_confirmed', ?, 'sent')
    `).run(
      shipmentId,
      awb_number,
      sender_phone,
      `Exolent Express: Consignment ${awb_number} booked successfully. Scheduled pickup on ${effectivePickupDate} (${pickup_slot}).`
    );

    // Audit Log
    logAudit(
      userId,
      session ? session.name : sender_name,
      session ? session.role : "customer",
      "BOOK_SHIPMENT",
      "SHIPMENT",
      awb_number,
      `New shipment booked with AWB ${awb_number} from ${sender_city} (${sender_pincode}) to ${recipient_city} (${recipient_pincode}). Amount: ₹${rate.totalAmount}`
    );

    return NextResponse.json({
      success: true,
      message: `Consignment booked successfully with AWB ${awb_number}`,
      data: {
        awb: awb_number,
        invoiceNumber,
        shipmentId,
        pickupDate: effectivePickupDate,
        pickupSlot: pickup_slot,
        dockGate: dock_gate,
        totalAmount: rate.totalAmount,
        breakdown: rate,
      },
    });
  } catch (error: any) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create shipment booking." },
      { status: 500 }
    );
  }
}
