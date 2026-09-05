# Exolent Express — Precision Freight & Hub Logistics Platform

A modern, production-grade courier and supply chain logistics management platform built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **SQLite (better-sqlite3)**.

---

## 🌟 Key Features

### 1. Customer Booking & Tracking Portal
- **Complete Address Routing**: Input sender pickup and receiver delivery addresses (Contact Person, Phone, Email, Company, Street Address, Landmark, City, State, Pincode, and GSTIN).
- **Serviceability & Pincode Lookup**: Real-time validation of postal zones, delivery time estimates, COD availability, and cold-chain compliance.
- **Dynamic Tariff & Cubing Engine**: Automatic volumetric weight calculation ($(L \times W \times H) / 5000$), fuel surcharges, goods insurance, and 18% GST.
- **Unique AWB Generation**: Generates standard consignment numbers (`EXL-XXXXXXX-IN`) checked against the database.
- **Live Consignment Tracking Ledger**: Public tracking page with chronological milestone scans, dock gate details, container seal numbers (`SL-XXXX`), and gate weights.
- **Printable e-Way Shipping Labels**: Printable barcode labels with consignor/consignee routing tags.
- **Saved Address Book**: Customer facility and destination warehouse templates.
- **Customer Support & Enquiries**: Ticket submission with AWB linking and status updates.

### 2. Multi-Role Admin Operations Control Room (`/admin`)
- **Operations Dashboard**: Real-time KPI cards, volume metrics, revenue summaries, and live dispatch stream.
- **Consignment & AWB Ledger**: Comprehensive table with status/service filtering, search, pagination, full address editor, driver/vehicle assignment, tracking scans, and CSV export.
- **Optical / Barcode Scanner Station**: Fast terminal to register linehaul ingress, departed trailers, and gate seals.
- **Proof of Delivery (POD)**: Recipient signature capture, receiver name, photo receipt URL, and instant status transition to Delivered.
- **Tariff & Rate Matrix Manager**: Configurable base rates, per-kg slabs, fuel surcharge index, transit insurance %, and GST %.
- **Pincode Master**: 19,000+ supportable postal codes with COD and cold-chain capability toggles.
- **Hub & Branch Network**: Configure regional sorting centers, dock bays, and facility managers across India.
- **Support Ticket Triage**: Customer ticket review and response management.
- **Invoices & COD Settlement**: GST freight invoices and Cash-on-Delivery remittance reconciliation.
- **Reports & Analytics**: Aggregated volume, service tier velocity, and master CSV exports.
- **System Audit Trail**: Immutable security log tracking staff actions and modifications.
- **Staff User Administration**: RBAC management for Super Admins, Operations, Branch Managers, Accounts, and Support.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ or v20+ / v22+
- **npm** or **yarn** / **pnpm**

### 2. Installation

```bash
# Clone repository
git clone https://github.com/Gopinanagare/courior.git
cd courior

# Install dependencies
npm install
```

### 3. Initialize & Seed Database

```bash
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build & Start

```bash
npm run build
npm start
```

---

## 🔑 Demo Login Accounts

All test accounts use the password: **`password123`** *(The login modal also features 1-click demo login buttons)*.

| Role | Email | Privileges |
| :--- | :--- | :--- |
| **Super Admin** | `admin@exolent.com` | Full administrative control across all modules |
| **Operations Lead** | `ops@exolent.com` | Consignments, Barcode Scanner, Hubs, Rates |
| **Branch Manager** | `branch@exolent.com` | Scoped hub operations and dispatches |
| **Customer Support** | `support@exolent.com` | Ticket triage and customer replies |
| **Accounts / Finance** | `accounts@exolent.com` | Invoices, COD settlement, and tariff adjustments |
| **Customer / Merchant** | `customer@medtech.com` | Booking consignments, saved address book, invoices |

---

## 📂 Project Structure

```
├── app/
│   ├── admin/                 # Admin operations pages (KPIs, shipments, scanner, rates, etc.)
│   ├── api/                   # RESTful API endpoints (auth, tracking, bookings, admin CRUD)
│   ├── book/                  # Customer booking flow with full pickup/drop addresses
│   ├── network-hubs/          # Regional logistics hubs directory
│   ├── portal/                # Customer merchant portal (shipments, addresses, support)
│   ├── rate-calculator/       # Interactive volumetric cubing & freight estimator
│   ├── services/              # Transport solutions & rate card catalog
│   ├── track/                 # Public consignment tracking page
│   ├── layout.tsx             # Root layout with Google Fonts & global styling
│   └── page.tsx               # Home landing page with Dual Dashboard
├── components/                # Reusable UI components (Navbar, Footer, DualDashboard, modals)
├── lib/
│   ├── auth.ts                # JWT authentication, bcrypt hashing, and RBAC middleware
│   ├── db.ts                  # SQLite singleton (WAL mode, busy timeout)
│   ├── pricing.ts             # Volumetric cubing weight & dynamic tariff engine
│   ├── schema.sql             # Relational DDL schema (12 tables)
│   └── seed.ts                # Seed dataset
├── scripts/
│   └── seed.js                # Database initialization script
└── public/                    # Static assets & icons
```

---

## 📄 License
MIT License.
