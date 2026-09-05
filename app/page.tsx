"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DualDashboard from "@/components/DualDashboard";
import Link from "next/link";
import { ShieldCheck, Zap, Globe2, ThermometerSnowflake, Truck, CheckCircle2, ArrowRight } from "lucide-react";

export default function HomePage() {
  const serviceHighlights = [
    {
      icon: <Zap className="w-5 h-5 text-secondary" />,
      title: "Express Air & Priority Cargo",
      desc: "Guaranteed 24-30 hour airport-to-hub express shuttles with expedited cross-dock staging.",
      badge: "Fastest Velocity",
      link: "/services#cargo",
    },
    {
      icon: <ThermometerSnowflake className="w-5 h-5 text-secondary" />,
      title: "Cold Chain Logistics (2°-8°C)",
      desc: "Validated temperature-controlled reefer fleet with continuous IoT hub telemetry logging.",
      badge: "Pharma & Biotech",
      link: "/services#cold",
    },
    {
      icon: <Truck className="w-5 h-5 text-secondary" />,
      title: "Surface Standard Freight",
      desc: "Economical full truckload (FTL) and less-than-truckload (LTL) scheduled linehaul trailers.",
      badge: "High Capacity",
      link: "/services#standard",
    },
    {
      icon: <Globe2 className="w-5 h-5 text-secondary" />,
      title: "Global Express International",
      desc: "Door-to-door cross-border freight with full customs clearance and documentation.",
      badge: "Worldwide",
      link: "/services#intl",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      <main className="w-full pt-16 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Dual Dashboard (Ship & Track) */}
        <DualDashboard />

        {/* Value Proposition & Courier Services Showcase */}
        <section className="mt-8 mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-200/80">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[11px] font-semibold uppercase tracking-wider mb-1.5 border border-teal-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Enterprise Transport Network</span>
              </div>
              <h2 className="font-headline font-bold text-2xl text-on-surface">
                Specialized Courier & Freight Capabilities
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Custom-built logistics infrastructure serving pharmaceuticals, heavy machinery, high-value electronics, and e-commerce.
              </p>
            </div>
            <Link
              href="/services"
              className="mt-3 sm:mt-0 inline-flex items-center gap-1 text-xs font-bold text-secondary hover:text-secondary-hover"
            >
              <span>Explore All 5 Transport Modes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {serviceHighlights.map((svc, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-surface-container-lowest border border-slate-200/70 shadow-xs hover:shadow-md hover:border-secondary/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                      {svc.icon}
                    </div>
                    <span className="text-[10px] font-mono-data font-semibold px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                      {svc.badge}
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-sm text-on-surface group-hover:text-secondary transition-colors">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    {svc.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={svc.link}
                    className="text-xs font-semibold text-secondary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>View Rate Cards</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Network Hub Coverage Banner */}
        <section className="mb-16 p-6 sm:p-8 rounded-2xl bg-primary text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10 max-w-2xl">
            <span className="text-[10px] font-mono-data uppercase tracking-wider text-teal-300 font-bold bg-white/10 px-2.5 py-1 rounded-full">
              Pan-India Linehaul Corridors
            </span>
            <h2 className="font-headline font-bold text-2xl sm:text-3xl mt-3 leading-tight">
              8 Regional Mega Hubs, 19,000+ Verified Delivery Pincodes
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              From Bangalore (BLR-WFD) to Mumbai (BOM-BHI), Delhi NCR (DEL-GUR), Pune (PNQ-HNJ), and Hyderabad (HYD-SHP), our automated sorting docks ensure zero delays.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/network-hubs"
                className="px-4 py-2 rounded-lg bg-secondary text-white font-headline font-bold text-xs hover:bg-secondary-hover transition-colors"
              >
                Inspect Hub Facilities & Docks
              </Link>
              <Link
                href="/rate-calculator"
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-headline font-semibold text-xs transition-colors border border-white/20"
              >
                Calculate Freight Tariff
              </Link>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:block opacity-20 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full" fill="currentColor">
              <polygon points="100,10 190,90 100,170 10,90" />
            </svg>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
