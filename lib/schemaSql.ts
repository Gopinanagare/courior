export const schemaSql = `
-- Exolent Express Courier Platform Relational Schema

-- 1. Branches / Hubs
CREATE TABLE IF NOT EXISTS branches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  address TEXT NOT NULL,
  dock_gates INTEGER DEFAULT 8,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users & Staff
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('super_admin', 'operations', 'branch_manager', 'support', 'accounts', 'customer')),
  phone TEXT,
  company_name TEXT,
  gstin TEXT,
  branch_id INTEGER REFERENCES branches(id),
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Courier Services Catalog
CREATE TABLE IF NOT EXISTS courier_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  transit_time_label TEXT NOT NULL,
  base_rate REAL NOT NULL,
  per_kg_rate REAL NOT NULL,
  volumetric_divisor INTEGER DEFAULT 5000,
  min_weight_kg REAL DEFAULT 0.5,
  is_active INTEGER DEFAULT 1,
  badge_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Pincode & Serviceability Master
CREATE TABLE IF NOT EXISTS pincodes (
  pincode TEXT PRIMARY KEY,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zone TEXT NOT NULL,
  hub_id INTEGER REFERENCES branches(id),
  is_serviceable INTEGER DEFAULT 1,
  is_cod_allowed INTEGER DEFAULT 1,
  is_cold_chain_allowed INTEGER DEFAULT 1,
  delivery_days_std INTEGER DEFAULT 3,
  delivery_days_exp INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Dynamic Tariff & Rate Surcharges
CREATE TABLE IF NOT EXISTS rate_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_name TEXT NOT NULL,
  fuel_surcharge_pct REAL DEFAULT 4.2,
  insurance_pct REAL DEFAULT 0.5,
  min_insurance_fee REAL DEFAULT 260.30,
  gst_pct REAL DEFAULT 18.0,
  cod_fixed_fee REAL DEFAULT 50.0,
  cod_pct REAL DEFAULT 1.5,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Shipments & Consignments
CREATE TABLE IF NOT EXISTS shipments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  awb_number TEXT UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  
  sender_name TEXT NOT NULL,
  sender_phone TEXT NOT NULL,
  sender_email TEXT,
  sender_company TEXT,
  sender_address TEXT NOT NULL,
  sender_landmark TEXT,
  sender_city TEXT NOT NULL,
  sender_state TEXT NOT NULL,
  sender_pincode TEXT NOT NULL,
  sender_gstin TEXT,
  
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_email TEXT,
  recipient_company TEXT,
  recipient_address TEXT NOT NULL,
  recipient_landmark TEXT,
  recipient_city TEXT NOT NULL,
  recipient_state TEXT NOT NULL,
  recipient_pincode TEXT NOT NULL,
  
  service_id INTEGER REFERENCES courier_services(id),
  service_code TEXT NOT NULL,
  service_name TEXT NOT NULL,
  package_type TEXT NOT NULL,
  cargo_category TEXT NOT NULL,
  pieces_count INTEGER DEFAULT 1,
  actual_weight_kg REAL NOT NULL,
  length_cm REAL DEFAULT 10,
  width_cm REAL DEFAULT 10,
  height_cm REAL DEFAULT 10,
  volumetric_weight_kg REAL NOT NULL,
  chargeable_weight_kg REAL NOT NULL,
  declared_value REAL DEFAULT 0,
  
  payment_mode TEXT NOT NULL CHECK(payment_mode IN ('prepaid', 'cod', 'to_pay')),
  cod_amount REAL DEFAULT 0,
  cod_status TEXT CHECK(cod_status IN ('pending', 'collected', 'remitted', 'na')) DEFAULT 'na',
  base_freight REAL NOT NULL,
  weight_surcharge REAL DEFAULT 0,
  fuel_surcharge REAL DEFAULT 0,
  insurance_fee REAL DEFAULT 0,
  tax_gst REAL DEFAULT 0,
  total_amount REAL NOT NULL,
  
  origin_hub_id INTEGER REFERENCES branches(id),
  destination_hub_id INTEGER REFERENCES branches(id),
  current_hub_id INTEGER REFERENCES branches(id),
  pickup_date DATE,
  pickup_slot TEXT,
  dock_gate TEXT,
  assigned_driver TEXT,
  assigned_vehicle TEXT,
  
  status TEXT NOT NULL CHECK(status IN (
    'booked', 
    'pickup_scheduled', 
    'picked_up', 
    'origin_hub', 
    'in_transit', 
    'destination_hub', 
    'out_for_delivery', 
    'delivered', 
    'failed', 
    'returned', 
    'cancelled'
  )) DEFAULT 'booked',
  
  pod_recipient_name TEXT,
  pod_signature_url TEXT,
  pod_photo_url TEXT,
  pod_delivered_at DATETIME,
  cancellation_reason TEXT,
  delivery_failure_reason TEXT,
  
  internal_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tracking Events Ledger
CREATE TABLE IF NOT EXISTS tracking_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shipment_id INTEGER NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  awb_number TEXT NOT NULL,
  status TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  facility_name TEXT NOT NULL,
  facility_code TEXT,
  location_city TEXT NOT NULL,
  dock_gate TEXT,
  container_seal TEXT,
  weight_at_gate REAL,
  created_by_user_id INTEGER REFERENCES users(id),
  event_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Customer Saved Address Book
CREATE TABLE IF NOT EXISTS saved_addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK(type IN ('sender', 'consignee', 'both')) DEFAULT 'both',
  label TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  company_name TEXT,
  address TEXT NOT NULL,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  gstin TEXT,
  is_default INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Invoices & Manifests
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT UNIQUE NOT NULL,
  shipment_id INTEGER NOT NULL REFERENCES shipments(id),
  awb_number TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id),
  subtotal REAL NOT NULL,
  tax_amount REAL NOT NULL,
  total_amount REAL NOT NULL,
  payment_status TEXT CHECK(payment_status IN ('paid', 'pending', 'refunded')) DEFAULT 'paid',
  payment_method TEXT DEFAULT 'Corporate Credit / Prepaid',
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Support Enquiries
CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_number TEXT UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  awb_number TEXT,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  priority TEXT CHECK(priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  response_notes TEXT,
  assigned_to_user_id INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Notification Logs
CREATE TABLE IF NOT EXISTS notification_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shipment_id INTEGER REFERENCES shipments(id),
  awb_number TEXT NOT NULL,
  recipient_contact TEXT NOT NULL,
  channel TEXT CHECK(channel IN ('email', 'sms', 'whatsapp')) NOT NULL,
  event_type TEXT NOT NULL,
  message_payload TEXT NOT NULL,
  status TEXT CHECK(status IN ('sent', 'delivered', 'failed')) DEFAULT 'sent',
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT NOT NULL,
  ip_address TEXT DEFAULT '127.0.0.1',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shipments_awb ON shipments(awb_number);
CREATE INDEX IF NOT EXISTS idx_shipments_user_id ON shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_tracking_awb ON tracking_events(awb_number);
CREATE INDEX IF NOT EXISTS idx_tracking_shipment ON tracking_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_pincodes_hub ON pincodes(hub_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_user ON enquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_awb ON invoices(awb_number);
`;
