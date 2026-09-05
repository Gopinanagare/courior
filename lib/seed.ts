import db, { initDB } from "./db";
import { hashPassword } from "./auth";

export function seedDatabase() {
  console.log("Seeding Exolent Express database...");
  initDB();

  // 1. Seed Branches / Hubs
  const branchCount = db.prepare("SELECT count(*) as count FROM branches").get() as any;
  if (branchCount.count === 0) {
    const insertBranch = db.prepare(`
      INSERT INTO branches (code, name, city, state, pincode, address, dock_gates, contact_name, contact_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertBranch.run(
      "BLR-WFD",
      "Bangalore Regional Sorting Center",
      "Bangalore",
      "Karnataka",
      "560066",
      "Unit 4B, Whitefield Logistics Corridor, EPIP Zone, Bangalore",
      18,
      "Naveen Ramamurthy",
      "+91 98450 11982"
    );

    insertBranch.run(
      "BOM-BHI",
      "Mumbai Bhiwandi Logistics Complex",
      "Mumbai",
      "Maharashtra",
      "421302",
      "Bhiwandi Integrated Freight City, Warehouse Block 12, Mumbai",
      24,
      "Harish Mehta",
      "+91 98200 44810"
    );

    insertBranch.run(
      "BOM-CEN",
      "Mumbai Central Distribution Center",
      "Mumbai",
      "Maharashtra",
      "400072",
      "Plot 14B, MIDC Kurla Road, Industrial Estate, Mumbai",
      12,
      "Sanjay Patil",
      "+91 98190 22345"
    );

    insertBranch.run(
      "DEL-GUR",
      "Delhi NCR Linehaul Terminal 1",
      "Gurugram",
      "Haryana",
      "122001",
      "Sector 37 DSIIDC Cargo Area, NH 48 Corridor, Gurugram/Delhi NCR",
      20,
      "Rajesh Verma",
      "+91 98110 55670"
    );

    insertBranch.run(
      "HYD-SHP",
      "Hyderabad Shamshabad Cargo Bay",
      "Hyderabad",
      "Telangana",
      "501218",
      "Shamshabad Cargo Airport Road, Logistics Cluster 3, Hyderabad",
      14,
      "Kiran Kumar",
      "+91 98480 33491"
    );

    insertBranch.run(
      "PNQ-HNJ",
      "Pune Hinjewadi Transit Hub",
      "Pune",
      "Maharashtra",
      "411057",
      "Phase 2, Hinjewadi Mega Logistics Corridor, Pune",
      10,
      "Amit Deshmukh",
      "+91 98220 77123"
    );

    insertBranch.run(
      "MAA-AMB",
      "Chennai Ambattur Freight Point",
      "Chennai",
      "Tamil Nadu",
      "600058",
      "Ambattur Industrial Estate, 3rd Main Rd, Chennai",
      12,
      "Senthil Nathan",
      "+91 98400 66890"
    );

    insertBranch.run(
      "CCU-TAR",
      "Kolkata Taratala Regional Hub",
      "Kolkata",
      "West Bengal",
      "700088",
      "Taratala Industrial Complex, Hide Road, Kolkata",
      10,
      "Subhasis Roy",
      "+91 98300 11234"
    );
  }

  // 2. Seed Users across roles (password: 'password123')
  const userCount = db.prepare("SELECT count(*) as count FROM users").get() as any;
  if (userCount.count === 0) {
    const defaultPassword = hashPassword("password123");
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone, company_name, gstin, branch_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Super Admin
    insertUser.run("Admin Executive", "admin@exolent.com", defaultPassword, "super_admin", "+91 98000 00001", "Exolent Express HQ", "29AABCE8942N1ZG", 1);
    
    // Operations Manager
    insertUser.run("Vikramaditya Rao", "ops@exolent.com", defaultPassword, "operations", "+91 98000 00002", "Exolent Operations", "29AABCE8942N1ZG", 1);

    // Branch Manager (Bangalore Whitefield)
    insertUser.run("Naveen Ramamurthy", "branch@exolent.com", defaultPassword, "branch_manager", "+91 98450 11982", "Exolent BLR Hub", "29AABCE8942N1ZG", 1);

    // Customer Support Lead
    insertUser.run("Pooja Sharma", "support@exolent.com", defaultPassword, "support", "+91 98000 00003", "Exolent Support Desk", "29AABCE8942N1ZG", 1);

    // Accounts & Billing
    insertUser.run("Deepak Agarwal", "accounts@exolent.com", defaultPassword, "accounts", "+91 98000 00004", "Exolent Finance", "29AABCE8942N1ZG", 1);

    // Verified Corporate Customer
    insertUser.run("MedTech Systems Corp", "customer@medtech.com", defaultPassword, "customer", "+91 98450 99881", "MedTech Devices Bangalore", "29MEDTC9912K1Z8", 1);

    // Verified Retail / Merchant Customer
    insertUser.run("Vanguard Pharma Corp", "vanguard@pharma.com", defaultPassword, "customer", "+91 98220 88990", "Vanguard Pharma India", "27VANGU7761L1ZQ", 2);
  }

  // 3. Seed Courier Services
  const svcCount = db.prepare("SELECT count(*) as count FROM courier_services").get() as any;
  if (svcCount.count === 0) {
    const insertSvc = db.prepare(`
      INSERT INTO courier_services (code, name, category, description, transit_time_label, base_rate, per_kg_rate, volumetric_divisor, min_weight_kg, badge_text)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertSvc.run(
      "standard",
      "Surface Standard",
      "Domestic Ground",
      "Scheduled inter-city linehaul via consolidated express trailers.",
      "48 - 60 Hrs",
      2800,
      2.50,
      5000,
      1.0,
      "Economical"
    );

    insertSvc.run(
      "cargo",
      "Express Cargo",
      "Domestic Priority Linehaul",
      "Priority airport-to-hub express shuttles with expedited staging.",
      "24 - 30 Hrs",
      3600,
      4.20,
      5000,
      1.0,
      "Most Popular"
    );

    insertSvc.run(
      "cold",
      "Cold Chain (2°-8°C)",
      "Temperature-Controlled",
      "Temperature-validated reefer network with continuous hub telemetry logging.",
      "28 - 36 Hrs",
      5400,
      8.50,
      4000,
      5.0,
      "Cold Chain"
    );

    insertSvc.run(
      "intl",
      "Global Express International",
      "International Freight",
      "Cross-border worldwide courier delivery with full customs clearance support.",
      "3 - 5 Days",
      6500,
      18.00,
      5000,
      0.5,
      "Global"
    );

    insertSvc.run(
      "hyper",
      "Same-Day Hyperlocal",
      "Intra-City Express",
      "Instant point-to-point intra-city dedicated courier with direct dock delivery.",
      "4 - 8 Hrs",
      950,
      12.00,
      5000,
      0.5,
      "Same Day"
    );
  }

  // 4. Seed Rate Rules
  const rulesCount = db.prepare("SELECT count(*) as count FROM rate_rules").get() as any;
  if (rulesCount.count === 0) {
    db.prepare(`
      INSERT INTO rate_rules (rule_name, fuel_surcharge_pct, insurance_pct, min_insurance_fee, gst_pct, cod_fixed_fee, cod_pct)
      VALUES ('Default Tariff Rules v4.1', 4.2, 0.5, 260.30, 18.0, 50.0, 1.5)
    `).run();
  }

  // 5. Seed Pincodes & Serviceability Master
  const pinCount = db.prepare("SELECT count(*) as count FROM pincodes").get() as any;
  if (pinCount.count === 0) {
    const insertPin = db.prepare(`
      INSERT INTO pincodes (pincode, city, state, zone, hub_id, is_serviceable, is_cod_allowed, is_cold_chain_allowed, delivery_days_std, delivery_days_exp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Bangalore
    insertPin.run("560066", "Bangalore", "Karnataka", "South", 1, 1, 1, 1, 2, 1);
    insertPin.run("560001", "Bangalore", "Karnataka", "South", 1, 1, 1, 1, 2, 1);
    insertPin.run("560100", "Bangalore", "Karnataka", "South", 1, 1, 1, 1, 2, 1);

    // Mumbai
    insertPin.run("400072", "Mumbai", "Maharashtra", "West", 3, 1, 1, 1, 2, 1);
    insertPin.run("400001", "Mumbai", "Maharashtra", "West", 3, 1, 1, 1, 2, 1);
    insertPin.run("421302", "Bhiwandi", "Maharashtra", "West", 2, 1, 1, 1, 2, 1);

    // Pune
    insertPin.run("411057", "Pune", "Maharashtra", "West", 6, 1, 1, 1, 2, 1);
    insertPin.run("411001", "Pune", "Maharashtra", "West", 6, 1, 1, 1, 2, 1);

    // Delhi NCR
    insertPin.run("122001", "Gurugram", "Haryana", "North", 4, 1, 1, 1, 2, 1);
    insertPin.run("110001", "New Delhi", "Delhi", "North", 4, 1, 1, 1, 2, 1);
    insertPin.run("201301", "Noida", "Uttar Pradesh", "North", 4, 1, 1, 1, 2, 1);

    // Hyderabad
    insertPin.run("500001", "Hyderabad", "Telangana", "South", 5, 1, 1, 1, 2, 1);
    insertPin.run("501218", "Hyderabad", "Telangana", "South", 5, 1, 1, 1, 2, 1);

    // Chennai
    insertPin.run("600058", "Chennai", "Tamil Nadu", "South", 7, 1, 1, 1, 2, 1);
    insertPin.run("600001", "Chennai", "Tamil Nadu", "South", 7, 1, 1, 1, 2, 1);

    // Kolkata
    insertPin.run("700088", "Kolkata", "West Bengal", "East", 8, 1, 1, 1, 3, 2);
    insertPin.run("700001", "Kolkata", "West Bengal", "East", 8, 1, 1, 1, 3, 2);
  }

  // 6. Seed Saved Addresses for Customer (user_id = 6)
  const addrCount = db.prepare("SELECT count(*) as count FROM saved_addresses").get() as any;
  if (addrCount.count === 0) {
    const insertAddr = db.prepare(`
      INSERT INTO saved_addresses (user_id, type, label, contact_name, phone, email, company_name, address, landmark, city, state, pincode, gstin, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAddr.run(
      6,
      "sender",
      "Whitefield Plant Dispatch",
      "Naveen Ramamurthy",
      "+91 98450 11982",
      "dispatch@medtech.com",
      "MedTech Devices Bangalore",
      "Unit 4B, Whitefield Logistics Corridor, EPIP Zone",
      "Near ITPL Gate 3",
      "Bangalore",
      "Karnataka",
      "560066",
      "29AABCE8942N1ZG",
      1
    );

    insertAddr.run(
      6,
      "consignee",
      "Mumbai Central Receiving Bay",
      "Harish Mehta",
      "+91 98200 44810",
      "receiving@vanguardpharma.com",
      "Vanguard Pharma Corp - Receiving Bay 7",
      "Plot 14B, MIDC Industrial Estate, Kurla Road",
      "Opposite Federal Bank",
      "Mumbai",
      "Maharashtra",
      "400072",
      "27VANGU7761L1ZQ",
      1
    );
  }

  // 7. Seed Shipments & Realistic Tracking Timelines
  const shipCount = db.prepare("SELECT count(*) as count FROM shipments").get() as any;
  if (shipCount.count === 0) {
    const insertShip = db.prepare(`
      INSERT INTO shipments (
        awb_number, user_id, sender_name, sender_phone, sender_email, sender_company, sender_address, sender_landmark, sender_city, sender_state, sender_pincode, sender_gstin,
        recipient_name, recipient_phone, recipient_email, recipient_company, recipient_address, recipient_landmark, recipient_city, recipient_state, recipient_pincode,
        service_id, service_code, service_name, package_type, cargo_category, pieces_count, actual_weight_kg, length_cm, width_cm, height_cm, volumetric_weight_kg, chargeable_weight_kg, declared_value,
        payment_mode, cod_amount, cod_status, base_freight, weight_surcharge, fuel_surcharge, insurance_fee, tax_gst, total_amount,
        origin_hub_id, destination_hub_id, current_hub_id, pickup_date, pickup_slot, dock_gate, assigned_driver, assigned_vehicle,
        status, internal_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Shipment 1: The flagship Stitch screen shipment EXL-9024881-IN (In-Transit at Pune Linehaul)
    const ship1 = insertShip.run(
      "EXL-9024881-IN",
      6,
      "Naveen Ramamurthy",
      "+91 98450 11982",
      "dispatch@medtech.com",
      "MedTech Devices Bangalore",
      "Unit 4B, Whitefield Logistics Corridor, EPIP Zone",
      "Near ITPL",
      "Bangalore",
      "Karnataka",
      "560066",
      "29AABCE8942N1ZG",
      "Harish Mehta",
      "+91 98200 44810",
      "receiving@vanguardpharma.com",
      "Vanguard Pharma Corp - Receiving Bay 7",
      "Plot 14B, MIDC Industrial Estate, Kurla Road",
      "Opposite Federal Bank",
      "Mumbai",
      "Maharashtra",
      "400072",
      2,
      "cargo",
      "Express Cargo",
      "pallet",
      "Precision Healthcare Devices",
      1,
      385.0,
      120.0,
      80.0,
      140.0,
      268.8,
      385.0,
      150000.0,
      "prepaid",
      0,
      "na",
      5400.0,
      962.50,
      267.20,
      260.30,
      1239.50,
      8129.50,
      1,
      3,
      6,
      "2024-10-23",
      "14:00 - 16:30 IST",
      "Gate D3",
      "Ramesh Gurung",
      "Eicher Pro 24ft (KA-03-HA-8812)",
      "in_transit",
      "High priority pharmaceutical consignment. Strict temperature logging required."
    );

    const ship1Id = ship1.lastInsertRowid;

    // Tracking events for EXL-9024881-IN (matching Stitch screen ledger)
    const insertTrack = db.prepare(`
      INSERT INTO tracking_events (shipment_id, awb_number, status, title, description, facility_name, facility_code, location_city, dock_gate, container_seal, weight_at_gate, created_by_user_id, event_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTrack.run(
      ship1Id,
      "EXL-9024881-IN",
      "booked",
      "Consignment Manifested & Dimension Verified",
      "Facility: Bangalore Regional Center. Booking logged by MedTech Systems Dispatch Bay.",
      "Bangalore Regional Sorting Center",
      "BLR-WFD",
      "Bangalore",
      "Gate D3",
      "SL-9938",
      385.0,
      2,
      "2024-10-23 16:15:00"
    );

    insertTrack.run(
      ship1Id,
      "EXL-9024881-IN",
      "picked_up",
      "Departed Origin Hub",
      "Facility: Bangalore Regional Sorting Center - Whitefield (BLR-WFD). Handed over to outbound linehaul crew.",
      "Bangalore Regional Sorting Center",
      "BLR-WFD",
      "Bangalore",
      "Gate 4",
      "SL-9938",
      385.0,
      2,
      "2024-10-23 19:40:00"
    );

    insertTrack.run(
      ship1Id,
      "EXL-9024881-IN",
      "in_transit",
      "Inbound Arrival at Regional Sort Hub",
      "Facility: Pune Linehaul Consolidation Hub (PNQ-HNJ). Unloaded from Inter-State Feeder #404.",
      "Pune Linehaul Consolidation Hub",
      "PNQ-HNJ",
      "Pune",
      "Dock 8",
      "SL-9940",
      385.2,
      2,
      "2024-10-23 23:10:00"
    );

    insertTrack.run(
      ship1Id,
      "EXL-9024881-IN",
      "in_transit",
      "Cross-Dock Automated Sorting Completed",
      "Facility: Pune Linehaul Hub (Sort Sorter Matrix 3). Cargo routed to Western Mumbai Corridor trailer.",
      "Pune Linehaul Consolidation Hub",
      "PNQ-HNJ",
      "Pune",
      "Dock 8",
      "SL-9940",
      385.2,
      2,
      "2024-10-24 02:40:00"
    );

    insertTrack.run(
      ship1Id,
      "EXL-9024881-IN",
      "in_transit",
      "Dispatched on Scheduled Linehaul Shuttle #882",
      "Facility: Pune Linehaul Consolidation Hub (PNQ-HNJ). Container Seal #SL-9941 validated intact.",
      "Pune Linehaul Consolidation Hub",
      "PNQ-HNJ",
      "Pune",
      "Dock 12",
      "SL-9941",
      385.2,
      2,
      "2024-10-24 04:15:00"
    );

    // Shipment 2: EXL-6612044-IN (Delivered with POD)
    const ship2 = insertShip.run(
      "EXL-6612044-IN",
      6,
      "Sunil Shetty",
      "+91 98450 44332",
      "sunil@autospares.in",
      "Apex Auto Parts Ltd",
      "Peenya Industrial Area, 4th Phase",
      "Near Shell Petrol Pump",
      "Bangalore",
      "Karnataka",
      "560058",
      "29APEXA4491N1ZX",
      "Mahesh Joshi",
      "+91 98200 33221",
      "mahesh@tatamotors-vendor.com",
      "Tata Motors Ancillary Unit 3",
      "MIDC Bhosari Industrial Area",
      "Gate 2",
      "Pune",
      "Maharashtra",
      "411026",
      1,
      "standard",
      "Surface Standard",
      "carton",
      "Automotive Spare Components",
      3,
      75.0,
      60.0,
      40.0,
      40.0,
      19.2,
      75.0,
      45000.0,
      "prepaid",
      0,
      "na",
      3220.0,
      187.50,
      143.10,
      260.30,
      685.96,
      4496.86,
      1,
      6,
      6,
      "2024-10-20",
      "10:00 - 13:00 IST",
      "Gate B1",
      "Anand Shinde",
      "Tata 407 (MH-12-PQ-4419)",
      "delivered",
      "Delivered successfully. Clean POD."
    );

    const ship2Id = ship2.lastInsertRowid;
    // Update POD details
    db.prepare(`
      UPDATE shipments SET
        pod_recipient_name = 'Mahesh Joshi (Store Incharge)',
        pod_signature_url = 'https://placehold.co/400x150/png?text=Verified+Digital+Signature+-+M.Joshi',
        pod_photo_url = 'https://placehold.co/600x400/png?text=Proof+of+Delivery+Receipt+Dock+Gate+2',
        pod_delivered_at = '2024-10-22 14:35:00'
      WHERE id = ?
    `).run(ship2Id);

    insertTrack.run(
      ship2Id,
      "EXL-6612044-IN",
      "booked",
      "Consignment Booked & Manifest Generated",
      "Electronic shipping label generated at Bangalore Peenya Hub.",
      "Bangalore Regional Sorting Center",
      "BLR-WFD",
      "Bangalore",
      "Gate B1",
      "SL-8812",
      75.0,
      2,
      "2024-10-20 11:30:00"
    );

    insertTrack.run(
      ship2Id,
      "EXL-6612044-IN",
      "in_transit",
      "Linehaul Transit to Pune Hub",
      "Departed Bangalore Hub enroute to Pune Hinjewadi Transit Hub.",
      "Bangalore Regional Sorting Center",
      "BLR-WFD",
      "Bangalore",
      "Gate 2",
      "SL-8812",
      75.0,
      2,
      "2024-10-20 21:00:00"
    );

    insertTrack.run(
      ship2Id,
      "EXL-6612044-IN",
      "destination_hub",
      "Arrived at Destination Hub",
      "Received and scanned into Pune Hub staging area.",
      "Pune Hinjewadi Transit Hub",
      "PNQ-HNJ",
      "Pune",
      "Dock 3",
      "SL-8812",
      75.0,
      2,
      "2024-10-21 22:15:00"
    );

    insertTrack.run(
      ship2Id,
      "EXL-6612044-IN",
      "out_for_delivery",
      "Out for Delivery",
      "Assigned to Anand Shinde (MH-12-PQ-4419) for last-mile delivery.",
      "Pune Hinjewadi Transit Hub",
      "PNQ-HNJ",
      "Pune",
      "Dock 1",
      "SL-8812",
      75.0,
      2,
      "2024-10-22 09:15:00"
    );

    insertTrack.run(
      ship2Id,
      "EXL-6612044-IN",
      "delivered",
      "Consignment Successfully Delivered",
      "Received and signed by Mahesh Joshi (Store Incharge) at Gate 2.",
      "Pune Consignee Facility",
      "PNQ-HNJ",
      "Pune",
      "Gate 2",
      "SL-8812",
      75.0,
      2,
      "2024-10-22 14:35:00"
    );

    // Shipment 3: EXL-89420-EXP (Ready at Gate 2, BLR -> DEL)
    const ship3 = insertShip.run(
      "EXL-89420-EXP",
      6,
      "Naveen Ramamurthy",
      "+91 98450 11982",
      "dispatch@medtech.com",
      "MedTech Devices Bangalore",
      "Unit 4B, Whitefield Logistics Corridor",
      "EPIP Zone",
      "Bangalore",
      "Karnataka",
      "560066",
      "29AABCE8942N1ZG",
      "Rohan Mehra",
      "+91 98110 99887",
      "rohan@delhiservers.com",
      "Delhi Data Center Spares Inc",
      "Cyber City, DLF Phase 2, Building 8C",
      "Tower B Reception",
      "Gurugram",
      "Haryana",
      "122002",
      2,
      "cargo",
      "Express Cargo",
      "carton",
      "Electronics & Server Spares",
      4,
      120.0,
      80.0,
      60.0,
      50.0,
      48.0,
      120.0,
      220000.0,
      "prepaid",
      0,
      "na",
      4464.0,
      504.0,
      208.66,
      1100.0,
      1130.0,
      7406.66,
      1,
      4,
      1,
      "2024-10-24",
      "15:30 - 18:00 IST",
      "Gate 2",
      "Pradeep Yadav",
      "BharatBenz 32ft (HR-55-AN-1922)",
      "pickup_scheduled",
      "Server rack spares. Fragile glass screens."
    );

    const ship3Id = ship3.lastInsertRowid;
    insertTrack.run(
      ship3Id,
      "EXL-89420-EXP",
      "pickup_scheduled",
      "Pickup Scheduled & Staged at Gate 2",
      "Consignment staged for direct linehaul connection to Delhi NCR Linehaul Terminal.",
      "Bangalore Regional Sorting Center",
      "BLR-WFD",
      "Bangalore",
      "Gate 2",
      "SL-9988",
      120.0,
      2,
      "2024-10-24 10:00:00"
    );

    // Invoices for seeded shipments
    db.prepare(`
      INSERT INTO invoices (invoice_number, shipment_id, awb_number, user_id, subtotal, tax_amount, total_amount, payment_status, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run("INV-2024-9024", ship1Id, "EXL-9024881-IN", 6, 6890.0, 1239.50, 8129.50, "paid", "Corporate Monthly Account");

    db.prepare(`
      INSERT INTO invoices (invoice_number, shipment_id, awb_number, user_id, subtotal, tax_amount, total_amount, payment_status, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run("INV-2024-6612", ship2Id, "EXL-6612044-IN", 6, 3810.90, 685.96, 4496.86, "paid", "Prepaid Razorpay / UPI");

    // Seed Notification logs
    db.prepare(`
      INSERT INTO notification_logs (shipment_id, awb_number, recipient_contact, channel, event_type, message_payload, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      ship1Id,
      "EXL-9024881-IN",
      "+91 98450 11982",
      "whatsapp",
      "booking_confirmed",
      "Exolent Express: Consignment EXL-9024881-IN booked successfully. Staged at Gate D3.",
      "sent"
    );

    db.prepare(`
      INSERT INTO notification_logs (shipment_id, awb_number, recipient_contact, channel, event_type, message_payload, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      ship1Id,
      "EXL-9024881-IN",
      "dispatch@medtech.com",
      "email",
      "in_transit",
      "Exolent Express Update: EXL-9024881-IN departed Pune Linehaul Hub on Shuttle #882.",
      "sent"
    );

    // Seed Customer Enquiry Ticket
    db.prepare(`
      INSERT INTO enquiries (ticket_number, user_id, name, email, phone, awb_number, subject, category, message, status, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "TKT-88401",
      6,
      "Naveen Ramamurthy",
      "dispatch@medtech.com",
      "+91 98450 11982",
      "EXL-9024881-IN",
      "Confirm Inbound Gate Arrival Time at Mumbai",
      "Delivery Delay",
      "Please confirm if the Mumbai Central Hub receiving supervisor will be available tomorrow at 08:30 IST for cold cargo handover.",
      "open",
      "high"
    );

    // Seed initial Audit Log
    db.prepare(`
      INSERT INTO audit_logs (user_id, user_name, user_role, action, entity_type, entity_id, details)
      VALUES (1, 'Admin Executive', 'super_admin', 'SYSTEM_INITIALIZATION', 'SYSTEM', '1', 'Initial database schema and tariff engine seeded.')
    `).run();
  }

  console.log("Database seeded successfully.");
}

// If run directly
if (process.argv[1]?.includes("seed")) {
  seedDatabase();
}
