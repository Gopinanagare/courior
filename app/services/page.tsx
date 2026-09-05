import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Zap, ThermometerSnowflake, Truck, Globe2, ShieldCheck, ArrowRight, Clock, Box } from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      id: "cargo",
      name: "Express Cargo Priority Linehaul",
      category: "Domestic Priority Air & Linehaul",
      transit: "24 - 30 Hours Guaranteed",
      baseRate: "₹3,600 Base (includes up to 10kg)",
      perKg: "₹4.20 per additional kg",
      description:
        "High-velocity priority transport connecting regional airports and express linehaul corridors across major metropolitan commercial centers with expedited dock staging.",
      features: [
        "Direct airport-to-hub express connections",
        "Dedicated container sealing with digital chain of custody",
        "Preferred docking bays with expedited staging",
        "Live hub manifest and departure telemetry",
      ],
      icon: <Zap className="w-6 h-6 text-teal-600" />,
      badge: "Most Popular for B2B",
    },
    {
      id: "cold",
      name: "Cold Chain Logistics (2°-8°C / -20°C)",
      category: "Temperature-Validated Healthcare Fleet",
      transit: "28 - 36 Hours Priority Transit",
      baseRate: "₹5,400 Base",
      perKg: "₹8.50 per additional kg",
      description:
        "Validated pharmaceutical and biological specimen transit with automated IoT thermal logging, backup generator reefers, and certified clean warehouse staging bays.",
      features: [
        "Continuous calibrated digital temperature probes",
        "Pre-cooling staging protocols at origin hub",
        "Pharma GDP compliance documentation",
        "Direct supervisor handover at hospital/lab receiving bays",
      ],
      icon: <ThermometerSnowflake className="w-6 h-6 text-teal-600" />,
      badge: "Pharma & Biotech",
    },
    {
      id: "standard",
      name: "Surface Standard Fleet Linehaul",
      category: "Economical Ground Logistics",
      transit: "48 - 60 Hours Scheduled",
      baseRate: "₹2,800 Base",
      perKg: "₹2.50 per additional kg",
      description:
        "Cost-effective national ground freight via scheduled 24ft and 32ft multi-axle trailers. Ideal for regular industrial replenishment, palletized stock, and automotive components.",
      features: [
        "Full pallet & industrial drum compatible",
        "Heavy cargo hydraulic tail-lift vehicles",
        "Integrated transit insurance coverage",
        "Daily scheduled inter-city linehaul departures",
      ],
      icon: <Truck className="w-6 h-6 text-teal-600" />,
      badge: "High Capacity / Heavy Freight",
    },
    {
      id: "intl",
      name: "Global Express International",
      category: "Cross-Border Worldwide Freight",
      transit: "3 - 5 Business Days",
      baseRate: "₹6,500 Base",
      perKg: "₹18.00 per additional kg",
      description:
        "Complete worldwide air express delivery to over 220 countries and territories with comprehensive customs clearance, export declarations, and global tracking.",
      features: [
        "Customs brokerage & electronic clearance support",
        "Door-to-door bonded air freight",
        "Dangerous Goods (DG) certified handling",
        "Commercial invoice and certificate of origin assistance",
      ],
      icon: <Globe2 className="w-6 h-6 text-teal-600" />,
      badge: "Cross-Border",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      <main className="w-full pt-20 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
            Transport Solutions Catalog
          </span>
          <h1 className="font-headline font-bold text-3xl sm:text-4xl text-slate-900 mt-2">
            Courier & Logistics Services
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Engineered freight solutions customized for enterprise supply chains, regulated pharmaceuticals, heavy industrial machinery, and time-critical consignments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {services.map((svc) => (
            <div
              key={svc.id}
              id={svc.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md hover:border-secondary/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
                    {svc.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-teal-50 text-teal-800 border border-teal-200">
                    {svc.badge}
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  {svc.category}
                </span>
                <h3 className="font-headline font-bold text-lg text-slate-900 mt-0.5">
                  {svc.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-teal-700 font-semibold mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{svc.transit}</span>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {svc.description}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block mb-2">
                    Key Specifications:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {svc.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Standard Tariff</span>
                  <span className="font-mono text-xs font-bold text-slate-900">{svc.baseRate}</span>
                </div>
                <Link
                  href="/book"
                  className="px-4 py-2 rounded-lg bg-secondary text-white font-headline font-bold text-xs hover:bg-secondary-hover transition-colors flex items-center gap-1"
                >
                  <span>Book Pickup</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
