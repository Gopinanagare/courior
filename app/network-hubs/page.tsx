import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Building, MapPin, Phone, ShieldCheck, Truck, Layers } from "lucide-react";

export default function NetworkHubsPage() {
  const hubs = [
    {
      code: "BLR-WFD",
      name: "Bangalore Regional Sorting Center",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560066",
      address: "Unit 4B, Whitefield Logistics Corridor, EPIP Zone, Bangalore",
      dockGates: 18,
      contact: "Naveen Ramamurthy",
      phone: "+91 98450 11982",
      type: "Primary South Consolidation Hub",
      dwellTime: "22 Mins",
    },
    {
      code: "BOM-BHI",
      name: "Mumbai Bhiwandi Logistics Complex",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "421302",
      address: "Bhiwandi Integrated Freight City, Warehouse Block 12, Mumbai",
      dockGates: 24,
      contact: "Harish Mehta",
      phone: "+91 98200 44810",
      type: "Primary West Gateway & Air Cargo Terminal",
      dwellTime: "18 Mins",
    },
    {
      code: "DEL-GUR",
      name: "Delhi NCR Linehaul Terminal 1",
      city: "Gurugram / Delhi NCR",
      state: "Haryana",
      pincode: "122001",
      address: "Sector 37 DSIIDC Cargo Area, NH 48 Corridor, Gurugram",
      dockGates: 20,
      contact: "Rajesh Verma",
      phone: "+91 98110 55670",
      type: "North Regional Sorting Terminal",
      dwellTime: "24 Mins",
    },
    {
      code: "PNQ-HNJ",
      name: "Pune Hinjewadi Transit Hub",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411057",
      address: "Phase 2, Hinjewadi Mega Logistics Corridor, Pune",
      dockGates: 10,
      contact: "Amit Deshmukh",
      phone: "+91 98220 77123",
      type: "Automated Cross-Dock Transit Node",
      dwellTime: "15 Mins",
    },
    {
      code: "HYD-SHP",
      name: "Hyderabad Shamshabad Cargo Bay",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "501218",
      address: "Shamshabad Cargo Airport Road, Logistics Cluster 3, Hyderabad",
      dockGates: 14,
      contact: "Kiran Kumar",
      phone: "+91 98480 33491",
      type: "Pharma Cold Chain & Air Hub",
      dwellTime: "20 Mins",
    },
    {
      code: "MAA-AMB",
      name: "Chennai Ambattur Freight Point",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600058",
      address: "Ambattur Industrial Estate, 3rd Main Rd, Chennai",
      dockGates: 12,
      contact: "Senthil Nathan",
      phone: "+91 98400 66890",
      type: "Coastal Port & Auto Spares Node",
      dwellTime: "25 Mins",
    },
    {
      code: "CCU-TAR",
      name: "Kolkata Taratala Regional Hub",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700088",
      address: "Taratala Industrial Complex, Hide Road, Kolkata",
      dockGates: 10,
      contact: "Subhasis Roy",
      phone: "+91 98300 11234",
      type: "Eastern Gateway Hub",
      dwellTime: "28 Mins",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      <main className="w-full pt-20 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
            Infrastructure Network
          </span>
          <h1 className="font-headline font-bold text-3xl sm:text-4xl text-slate-900 mt-2">
            Regional Staging & Sorting Hubs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Strategically located automated transit hubs across major logistics corridors featuring dedicated docking bays, continuous barcode scan telemetry, and reefer staging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hubs.map((hub, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md hover:border-secondary/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-teal-50 text-teal-800 border border-teal-200">
                    Node: {hub.code}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {hub.dockGates} Dock Gates
                  </span>
                </div>

                <h3 className="font-headline font-bold text-base text-slate-900 leading-tight">
                  {hub.name}
                </h3>
                <span className="text-[11px] font-semibold text-secondary block mt-1">
                  {hub.type}
                </span>

                <p className="text-xs text-slate-600 mt-3 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{hub.address} - <strong className="text-slate-800">{hub.pincode}</strong></span>
                </p>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Facility Incharge:</span>
                    <span className="font-semibold text-slate-800">{hub.contact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Desk Phone:</span>
                    <span className="font-mono text-slate-800">{hub.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Avg Dwell Time:</span>
                    <span className="font-mono font-bold text-teal-700">{hub.dwellTime}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ISO 9001 Facility</span>
                </span>
                <a
                  href={`tel:${hub.phone}`}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5 text-secondary" />
                  <span>Call Desk</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
