import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth, logAudit } from "@/lib/auth";
import { calculateShippingRate, generateAwbNumber, generateInvoiceNumber } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = requireAuth(req, ["super_admin", "operations", "branch_manager", "support", "accounts"]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();
    const status = searchParams.get("status");
    const service = searchParams.get("service");
    const branchId = searchParams.get("branch_id");
    const exportCsv = searchParams.get("export") === "true";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(10, Number(searchParams.get("limit")) || 25);
    const offset = (page - 1) * limit;

    let sql = `
      SELECT 
        s.*,
        ob.name as origin_hub_name, ob.code as origin_hub_code,
        db.name as dest_hub_name, db.code as dest_hub_code,
        cb.name as current_hub_name, cb.code as current_hub_code,
        u.name as customer_name, u.email as customer_email
      FROM shipments s
      LEFT JOIN branches ob ON s.origin_hub_id = ob.id
      LEFT JOIN branches db ON s.destination_hub_id = db.id
      LEFT JOIN branches cb ON s.current_hub_id = cb.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Branch manager scope
    if (user?.role === "branch_manager" && user.branch_id) {
      sql += " AND (s.origin_hub_id = ? OR s.destination_hub_id = ? OR s.current_hub_id = ?)";
      params.push(user.branch_id, user.branch_id, user.branch_id);
    } else if (branchId) {
      sql += " AND (s.origin_hub_id = ? OR s.destination_hub_id = ? OR s.current_hub_id = ?)";
      params.push(branchId, branchId, branchId);
    }

    if (status && status !== "all") {
      sql += " AND s.status = ?";
      params.push(status);
    }

    if (service && service !== "all") {
      sql += " AND s.service_code = ?";
      params.push(service);
    }

    if (query) {
      sql += ` AND (
        s.awb_number LIKE ? OR 
        s.sender_name LIKE ? OR 
        s.sender_city LIKE ? OR 
        s.sender_pincode LIKE ? OR
        s.recipient_name LIKE ? OR 
        s.recipient_city LIKE ? OR 
        s.recipient_pincode LIKE ? OR
        s.assigned_driver LIKE ? OR
        s.assigned_vehicle LIKE ?
      )`;
      const qWild = `%${query}%`;
      params.push(qWild, qWild, qWild, qWild, qWild, qWild, qWild, qWild, qWild);
    }

    if (exportCsv) {
      sql += " ORDER BY s.created_at DESC";
      const allRows = db.prepare(sql).all(...params);
      
      // Build CSV header & rows
      const headers = [
        "AWB Number",
        "Status",
        "Service",
        "Sender Name",
        "Sender Phone",
        "Sender Address",
        "Sender City",
        "Sender State",
        "Sender Pincode",
        "Recipient Name",
        "Recipient Phone",
        "Recipient Address",
        "Recipient City",
        "Recipient State",
        "Recipient Pincode",
        "Weight (KG)",
        "Chargeable Wt (KG)",
        "Pieces",
        "Payment Mode",
        "COD Amount",
        "Total Freight (INR)",
        "Origin Hub",
        "Destination Hub",
        "Assigned Driver",
        "Assigned Vehicle",
        "Created At"
      ];

      const csvRows = [headers.join(",")];
      allRows.forEach((r: any) => {
        const row = [
          `"${r.awb_number}"`,
          `"${r.status}"`,
          `"${r.service_name}"`,
          `"${r.sender_name.replace(/"/g, '""')}"`,
          `"${r.sender_phone}"`,
          `"${(r.sender_address || "").replace(/"/g, '""')}"`,
          `"${r.sender_city}"`,
          `"${r.sender_state || ""}"`,
          `"${r.sender_pincode}"`,
          `"${r.recipient_name.replace(/"/g, '""')}"`,
          `"${r.recipient_phone}"`,
          `"${(r.recipient_address || "").replace(/"/g, '""')}"`,
          `"${r.recipient_city}"`,
          `"${r.recipient_state || ""}"`,
          `"${r.recipient_pincode}"`,
          r.actual_weight_kg,
          r.chargeable_weight_kg,
          r.pieces_count,
          `"${r.payment_mode}"`,
          r.cod_amount,
          r.total_amount,
          `"${r.origin_hub_name || ""}"`,
          `"${r.dest_hub_name || ""}"`,
          `"${r.assigned_driver || ""}"`,
          `"${r.assigned_vehicle || ""}"`,
          `"${r.created_at}"`
        ];
        csvRows.push(row.join(","));
      });

      return new NextResponse(csvRows.join("\n"), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="exolent_shipments_${Date.now()}.csv"`,
        },
      });
    }

    // Pagination count
    const countSql = sql.replace(/SELECT\s+s\.\*[\s\S]*?FROM/, "SELECT count(*) as count FROM");
    const totalCount = (db.prepare(countSql).get(...params) as any)?.count || 0;

    sql += " ORDER BY s.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const shipments = db.prepare(sql).all(...params);

    return NextResponse.json({
      success: true,
      data: shipments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error("Admin shipments list error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = requireAuth(req, ["super_admin", "operations", "branch_manager"]);
    if (errorResponse) return errorResponse;

    const body = await req.json();

    const {
      // Sender / Pickup Full Details
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

      // Recipient / Drop Full Details
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
      origin_hub_id,
      destination_hub_id,
      pickup_date,
      pickup_slot = "14:00 - 16:30 IST",
      dock_gate = "Gate 1",
      assigned_driver,
      assigned_vehicle,
      internal_notes,
      custom_awb,
    } = body;

    if (!sender_name || !sender_phone || !sender_address || !sender_city || !sender_pincode) {
      return NextResponse.json(
        { success: false, message: "Complete Sender / Pickup address is required." },
        { status: 400 }
      );
    }

    if (!recipient_name || !recipient_phone || !recipient_address || !recipient_city || !recipient_pincode) {
      return NextResponse.json(
        { success: false, message: "Complete Recipient / Drop address is required." },
        { status: 400 }
      );
    }

    const service = db.prepare("SELECT * FROM courier_services WHERE code = ? AND is_active = 1").get(service_code) as any;
    if (!service) {
      return NextResponse.json({ success: false, message: "Invalid service code." }, { status: 400 });
    }

    // AWB uniqueness check
    let awb_number = custom_awb ? custom_awb.trim().toUpperCase() : generateAwbNumber();
    const existing = db.prepare("SELECT id FROM shipments WHERE awb_number = ?").get(awb_number);
    if (existing) {
      if (custom_awb) {
        return NextResponse.json({ success: false, message: `AWB ${awb_number} already exists. AWBs must be globally unique.` }, { status: 409 });
      }
      awb_number = generateAwbNumber();
    }

    // Hub resolution
    const resolvedOriginHubId = origin_hub_id || user?.branch_id || 1;
    const resolvedDestHubId = destination_hub_id || 3;

    // Pricing
    const rate = calculateShippingRate({
      serviceCode: service_code,
      actualWeightKg: Number(actual_weight_kg),
      lengthCm: Number(length_cm),
      widthCm: Number(width_cm),
      heightCm: Number(height_cm),
      declaredValue: Number(declared_value),
      originPincode: sender_pincode,
      destinationPincode: recipient_pincode,
      paymentMode: payment_mode as any,
      codAmount: Number(cod_amount),
    });

    const effectivePickupDate = pickup_date || new Date().toISOString().split("T")[0];

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
        assigned_driver, assigned_vehicle,
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
        ?, ?,
        ?, ?
      )
    `);

    const result = stmt.run(
      awb_number,
      null, // Admin created
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

      resolvedOriginHubId,
      resolvedDestHubId,
      resolvedOriginHubId,
      effectivePickupDate,
      pickup_slot,
      dock_gate,
      assigned_driver || null,
      assigned_vehicle || null,

      "booked",
      internal_notes || null
    );

    const shipmentId = Number(result.lastInsertRowid);
    const originHub = db.prepare("SELECT name, code FROM branches WHERE id = ?").get(resolvedOriginHubId) as any;

    // Initial Tracking scan
    db.prepare(`
      INSERT INTO tracking_events (
        shipment_id, awb_number, status, title, description,
        facility_name, facility_code, location_city, dock_gate, weight_at_gate, created_by_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      shipmentId,
      awb_number,
      "booked",
      "Consignment Created & Staged by Operations",
      `Operational manifest created by ${user?.name}. Staged at ${originHub?.name || "Origin Hub"} (${dock_gate}).`,
      originHub?.name || "Origin Hub",
      originHub?.code || "BLR-WFD",
      sender_city,
      dock_gate,
      rate.actualWeightKg,
      user?.id
    );

    // Invoice
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
      null,
      rate.baseFreight + rate.weightSurcharge + rate.fuelSurcharge + rate.insuranceFee,
      rate.taxGst,
      rate.totalAmount,
      payment_mode === "prepaid" ? "paid" : "pending",
      payment_mode === "prepaid" ? "Admin Manual / Credit" : payment_mode.toUpperCase()
    );

    logAudit(
      user?.id || null,
      user?.name || "Admin",
      user?.role || "super_admin",
      "ADMIN_CREATE_SHIPMENT",
      "SHIPMENT",
      awb_number,
      `Admin created AWB ${awb_number} (Sender: ${sender_city}, Recipient: ${recipient_city}). Amount: ₹${rate.totalAmount}`
    );

    return NextResponse.json({
      success: true,
      message: `Shipment ${awb_number} created successfully.`,
      data: {
        awb: awb_number,
        shipmentId,
        invoiceNumber,
        totalAmount: rate.totalAmount,
      },
    });
  } catch (error: any) {
    console.error("Admin create shipment error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
