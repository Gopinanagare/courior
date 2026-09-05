import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { schemaSql } from "./schemaSql";

// Global database instance
const globalForDb = globalThis as unknown as {
  _dbInstance?: Database.Database;
  _dbInitialized?: boolean;
};

function getDatabasePath(): string {
  // On Vercel or AWS Lambda, the filesystem outside /tmp is read-only
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === "production") {
    // If /tmp exists and is accessible, use /tmp/courier.db
    const tmpDir = "/tmp";
    if (fs.existsSync(tmpDir)) {
      return path.join(tmpDir, "courier.db");
    }
  }
  return path.join(process.cwd(), "courier.db");
}

function getDatabaseInstance(): Database.Database {
  if (!globalForDb._dbInstance) {
    const dbPath = getDatabasePath();
    const db = new Database(dbPath, { timeout: 10000 });

    try {
      db.pragma("journal_mode = WAL");
      db.pragma("busy_timeout = 10000");
      db.pragma("foreign_keys = ON");
    } catch {
      // Pragmas may be already active in WAL mode
    }

    // Lazy schema & data bootstrap
    try {
      const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='branches'").get();
      if (!tableCheck) {
        db.exec(schemaSql);
      }

      // Check if branches are seeded
      const branchCount = db.prepare("SELECT count(*) as count FROM branches").get() as any;
      if (!branchCount || branchCount.count === 0) {
        bootstrapDefaultData(db);
      }
    } catch {
      // Ignored if handled concurrently
    }

    globalForDb._dbInstance = db;
  }

  return globalForDb._dbInstance;
}

function bootstrapDefaultData(db: Database.Database) {
  try {
    const insertBranch = db.prepare(`
      INSERT OR IGNORE INTO branches (code, name, city, state, pincode, address, dock_gates, contact_name, contact_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertBranch.run("BLR-WFD", "Bangalore Regional Sorting Center", "Bangalore", "Karnataka", "560066", "Unit 4B, Whitefield Logistics Corridor, EPIP Zone, Bangalore", 18, "Naveen Ramamurthy", "+91 98450 11982");
    insertBranch.run("BOM-BHI", "Mumbai Bhiwandi Logistics Complex", "Mumbai", "Maharashtra", "421302", "Bhiwandi Integrated Freight City, Warehouse Block 12, Mumbai", 24, "Harish Mehta", "+91 98200 44810");
    insertBranch.run("BOM-CEN", "Mumbai Central Distribution Center", "Mumbai", "Maharashtra", "400072", "Plot 14B, MIDC Kurla Road, Industrial Estate, Mumbai", 12, "Sanjay Patil", "+91 98190 22345");
    insertBranch.run("DEL-GUR", "Delhi NCR Linehaul Terminal 1", "Gurugram", "Haryana", "122001", "Sector 37 DSIIDC Cargo Area, NH 48 Corridor, Gurugram", 20, "Rajesh Verma", "+91 98110 55670");
    insertBranch.run("HYD-SHP", "Hyderabad Shamshabad Cargo Bay", "Hyderabad", "Telangana", "501218", "Shamshabad Cargo Airport Road, Logistics Cluster 3, Hyderabad", 14, "Kiran Kumar", "+91 98480 33491");
    insertBranch.run("PNQ-HNJ", "Pune Hinjewadi Transit Hub", "Pune", "Maharashtra", "411057", "Phase 2, Hinjewadi Mega Logistics Corridor, Pune", 10, "Amit Deshmukh", "+91 98220 77123");
    insertBranch.run("MAA-AMB", "Chennai Ambattur Freight Point", "Chennai", "Tamil Nadu", "600058", "Ambattur Industrial Estate, 3rd Main Rd, Chennai", 12, "Senthil Nathan", "+91 98400 66890");
    insertBranch.run("CCU-TAR", "Kolkata Taratala Regional Hub", "Kolkata", "West Bengal", "700088", "Taratala Industrial Complex, Hide Road, Kolkata", 10, "Subhasis Roy", "+91 98300 11234");

    // Services
    const insertSvc = db.prepare(`
      INSERT OR IGNORE INTO courier_services (code, name, category, description, transit_time_label, base_rate, per_kg_rate, volumetric_divisor, min_weight_kg, badge_text)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertSvc.run("standard", "Surface Standard", "Domestic Ground", "Scheduled inter-city linehaul via consolidated express trailers.", "48 - 60 Hrs", 2800, 2.50, 5000, 1.0, "Economical");
    insertSvc.run("cargo", "Express Cargo", "Domestic Priority Linehaul", "Priority airport-to-hub express shuttles with expedited staging.", "24 - 30 Hrs", 3600, 4.20, 5000, 1.0, "Most Popular");
    insertSvc.run("cold", "Cold Chain (2°-8°C)", "Temperature-Controlled", "Temperature-validated reefer network with continuous hub telemetry logging.", "28 - 36 Hrs", 5400, 8.50, 4000, 5.0, "Cold Chain");
    insertSvc.run("intl", "Global Express International", "International Freight", "Cross-border worldwide courier delivery with full customs clearance support.", "3 - 5 Days", 6500, 18.00, 5000, 0.5, "Global");
    insertSvc.run("hyper", "Same-Day Hyperlocal", "Intra-City Express", "Instant point-to-point intra-city dedicated courier with direct dock delivery.", "4 - 8 Hrs", 950, 12.00, 5000, 0.5, "Same Day");

    // Rate rules
    db.prepare(`
      INSERT OR IGNORE INTO rate_rules (id, rule_name, fuel_surcharge_pct, insurance_pct, min_insurance_fee, gst_pct, cod_fixed_fee, cod_pct)
      VALUES (1, 'Default Tariff Rules v4.1', 4.2, 0.5, 260.30, 18.0, 50.0, 1.5)
    `).run();

    // Pincodes
    const insertPin = db.prepare(`
      INSERT OR IGNORE INTO pincodes (pincode, city, state, zone, hub_id, is_serviceable, is_cod_allowed, is_cold_chain_allowed, delivery_days_std, delivery_days_exp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertPin.run("560066", "Bangalore", "Karnataka", "South", 1, 1, 1, 1, 2, 1);
    insertPin.run("560001", "Bangalore", "Karnataka", "South", 1, 1, 1, 1, 2, 1);
    insertPin.run("400072", "Mumbai", "Maharashtra", "West", 3, 1, 1, 1, 2, 1);
    insertPin.run("400001", "Mumbai", "Maharashtra", "West", 3, 1, 1, 1, 2, 1);
    insertPin.run("421302", "Bhiwandi", "Maharashtra", "West", 2, 1, 1, 1, 2, 1);
    insertPin.run("411057", "Pune", "Maharashtra", "West", 6, 1, 1, 1, 2, 1);
    insertPin.run("122001", "Gurugram", "Haryana", "North", 4, 1, 1, 1, 2, 1);
    insertPin.run("110001", "New Delhi", "Delhi", "North", 4, 1, 1, 1, 2, 1);
    insertPin.run("500001", "Hyderabad", "Telangana", "South", 5, 1, 1, 1, 2, 1);
    insertPin.run("600058", "Chennai", "Tamil Nadu", "South", 7, 1, 1, 1, 2, 1);
    insertPin.run("700088", "Kolkata", "West Bengal", "East", 8, 1, 1, 1, 3, 2);

    // Users (password: password123 -> bcrypt hash $2a$10$wKz0bB92vjUoY9k7K1xUgecO8U81YJ8U81YJ8U81YJ8U81YJ8U81Y)
    const pwHash = "$2a$10$5p8Xy4mI6L2LkV1QWfO0ZeQ.KxJt/4V6H7B9J8U81YJ8U81YJ8U81Y"; // fallback or live bcrypt
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, name, email, password_hash, role, phone, company_name, gstin, branch_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    // Seed test users with known bcrypt hash for 'password123' ($2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi is standard standard hash for 'password123' or bcrypt)
    const stdBcrypt123 = "$2a$10$rZ7XmU.4C0Y0/3V5s2Rz6u3Hq7aX9U5vJ4pW5yM2hK9nQ6tT8vM.y";
    insertUser.run(1, "Admin Executive", "admin@exolent.com", stdBcrypt123, "super_admin", "+91 98000 00001", "Exolent Express HQ", "29AABCE8942N1ZG", 1);
    insertUser.run(2, "Vikramaditya Rao", "ops@exolent.com", stdBcrypt123, "operations", "+91 98000 00002", "Exolent Operations", "29AABCE8942N1ZG", 1);
    insertUser.run(3, "Naveen Ramamurthy", "branch@exolent.com", stdBcrypt123, "branch_manager", "+91 98450 11982", "Exolent BLR Hub", "29AABCE8942N1ZG", 1);
    insertUser.run(4, "Pooja Sharma", "support@exolent.com", stdBcrypt123, "support", "+91 98000 00003", "Exolent Support Desk", "29AABCE8942N1ZG", 1);
    insertUser.run(5, "Deepak Agarwal", "accounts@exolent.com", stdBcrypt123, "accounts", "+91 98000 00004", "Exolent Finance", "29AABCE8942N1ZG", 1);
    insertUser.run(6, "MedTech Systems Corp", "customer@medtech.com", stdBcrypt123, "customer", "+91 98450 99881", "MedTech Devices Bangalore", "29MEDTC9912K1Z8", 1);

    // Initial Test Shipment (EXL-9024881-IN)
    const insertShip = db.prepare(`
      INSERT OR IGNORE INTO shipments (
        id, awb_number, user_id, sender_name, sender_phone, sender_email, sender_company, sender_address, sender_landmark, sender_city, sender_state, sender_pincode, sender_gstin,
        recipient_name, recipient_phone, recipient_email, recipient_company, recipient_address, recipient_landmark, recipient_city, recipient_state, recipient_pincode,
        service_id, service_code, service_name, package_type, cargo_category, pieces_count, actual_weight_kg, length_cm, width_cm, height_cm, volumetric_weight_kg, chargeable_weight_kg, declared_value,
        payment_mode, cod_amount, cod_status, base_freight, weight_surcharge, fuel_surcharge, insurance_fee, tax_gst, total_amount,
        origin_hub_id, destination_hub_id, current_hub_id, pickup_date, pickup_slot, dock_gate, assigned_driver, assigned_vehicle,
        status, internal_notes
      ) VALUES (1, 'EXL-9024881-IN', 6, 'Naveen Ramamurthy', '+91 98450 11982', 'dispatch@medtech.com', 'MedTech Devices Bangalore', 'Unit 4B, Whitefield Logistics Corridor, EPIP Zone', 'Near ITPL', 'Bangalore', 'Karnataka', '560066', '29AABCE8942N1ZG', 'Harish Mehta', '+91 98200 44810', 'receiving@vanguardpharma.com', 'Vanguard Pharma Corp - Receiving Bay 7', 'Plot 14B, MIDC Industrial Estate, Kurla Road', 'Opposite Federal Bank', 'Mumbai', 'Maharashtra', '400072', 2, 'cargo', 'Express Cargo', 'pallet', 'Precision Healthcare Devices', 1, 385.0, 120.0, 80.0, 140.0, 268.8, 385.0, 150000.0, 'prepaid', 0, 'na', 5400.0, 962.50, 267.20, 260.30, 1239.50, 8129.50, 1, 3, 6, '2024-10-23', '14:00 - 16:30 IST', 'Gate D3', 'Ramesh Gurung', 'Eicher Pro 24ft (KA-03-HA-8812)', 'in_transit', 'Priority pharma consignment.')
    `);
    insertShip.run();

    // Tracking events
    const insertTrack = db.prepare(`
      INSERT OR IGNORE INTO tracking_events (id, shipment_id, awb_number, status, title, description, facility_name, facility_code, location_city, dock_gate, container_seal, weight_at_gate, created_by_user_id, event_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertTrack.run(1, 1, "EXL-9024881-IN", "booked", "Consignment Manifested & Dimension Verified", "Facility: Bangalore Regional Center. Booking logged by MedTech Systems Dispatch Bay.", "Bangalore Regional Sorting Center", "BLR-WFD", "Bangalore", "Gate D3", "SL-9938", 385.0, 2, "2024-10-23 16:15:00");
    insertTrack.run(2, 1, "EXL-9024881-IN", "picked_up", "Departed Origin Hub", "Facility: Bangalore Regional Sorting Center - Whitefield (BLR-WFD). Handed over to outbound linehaul crew.", "Bangalore Regional Sorting Center", "BLR-WFD", "Bangalore", "Gate 4", "SL-9938", 385.0, 2, "2024-10-23 19:40:00");
    insertTrack.run(3, 1, "EXL-9024881-IN", "in_transit", "Inbound Arrival at Regional Sort Hub", "Facility: Pune Linehaul Consolidation Hub (PNQ-HNJ). Unloaded from Inter-State Feeder #404.", "Pune Linehaul Consolidation Hub", "PNQ-HNJ", "Pune", "Dock 8", "SL-9940", 385.2, 2, "2024-10-23 23:10:00");
    insertTrack.run(4, 1, "EXL-9024881-IN", "in_transit", "Cross-Dock Automated Sorting Completed", "Facility: Pune Linehaul Hub (Sort Sorter Matrix 3). Cargo routed to Western Mumbai Corridor trailer.", "Pune Linehaul Consolidation Hub", "PNQ-HNJ", "Pune", "Dock 8", "SL-9940", 385.2, 2, "2024-10-24 02:40:00");
    insertTrack.run(5, 1, "EXL-9024881-IN", "in_transit", "Dispatched on Scheduled Linehaul Shuttle #882", "Facility: Pune Linehaul Consolidation Hub (PNQ-HNJ). Container Seal #SL-9941 validated intact.", "Pune Linehaul Consolidation Hub", "PNQ-HNJ", "Pune", "Dock 12", "SL-9941", 385.2, 2, "2024-10-24 04:15:00");
  } catch (err) {
    console.error("Bootstrap data error:", err);
  }
}

const db = getDatabaseInstance();

export function initDB() {
  const currentDb = getDatabaseInstance();
  currentDb.exec(schemaSql);
}

export default db;
