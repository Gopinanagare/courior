import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, Clock, Award, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-slate-200/80 mt-16 shadow-[0_-1px_8px_rgba(0,0,0,0.02)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-xs">
                <svg viewBox="0 0 32 32" className="w-4 h-4" fill="none">
                  <path d="M9 16L16 9L23 16L16 23Z" fill="#14B8A6" fillOpacity="0.9" />
                  <path d="M16 13L20 16L16 19L12 16Z" fill="#F8FAFC" />
                  <circle cx="21" cy="21" r="2.5" fill="#38BDF8" />
                </svg>
              </div>
              <span className="font-headline font-bold text-base text-on-surface">
                Exolent Express
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Intelligent courier logistics engineered for absolute reliability, precision routing, and end-to-end transparency across India and worldwide.
            </p>
            <div className="pt-2 text-xs space-y-1 text-slate-500">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-secondary" />
                <span>24/7 Operations Desk: 1800-890-EXOLENT</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-secondary" />
                <span>support@exolentexpress.com</span>
              </div>
            </div>
          </div>

          {/* Tracking & Quick Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3">
              Tracking & Operations
            </h4>
            <ul className="space-y-2 text-xs text-on-surface-variant">
              <li>
                <Link href="/track" className="hover:text-secondary transition-colors">
                  Live AWB Multi-Consignment Tracking
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-secondary transition-colors">
                  Proof of Delivery (POD) & Manifests
                </Link>
              </li>
              <li>
                <Link href="/rate-calculator" className="hover:text-secondary transition-colors">
                  Freight Tariff & Volumetric Calculator
                </Link>
              </li>
              <li>
                <Link href="/network-hubs" className="hover:text-secondary transition-colors">
                  Regional Staging Hub Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Logistics Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3">
              Courier Services
            </h4>
            <ul className="space-y-2 text-xs text-on-surface-variant">
              <li>
                <Link href="/services#cold" className="hover:text-secondary transition-colors">
                  Same-Day Cold Chain (2°-8°C)
                </Link>
              </li>
              <li>
                <Link href="/services#cargo" className="hover:text-secondary transition-colors">
                  Express Cargo Priority Linehaul
                </Link>
              </li>
              <li>
                <Link href="/services#standard" className="hover:text-secondary transition-colors">
                  Scheduled Surface Fleet Linehaul
                </Link>
              </li>
              <li>
                <Link href="/services#intl" className="hover:text-secondary transition-colors">
                  Cross-Border Global Freight Express
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Standards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3">
              Standards & Integrity
            </h4>
            <ul className="space-y-2 text-xs text-on-surface-variant">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                <span>ISO 9001:2015 Certified Chain of Custody</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-secondary" />
                <span>98.4% Scheduled Inbound Accuracy</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-secondary" />
                <span>Zero Micro-GPS Noise Policy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-on-surface-variant">
          <p>© {new Date().getFullYear()} Exolent Express Logistics Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/privacy" className="hover:text-on-surface">Privacy Protocol</Link>
            <Link href="/terms" className="hover:text-on-surface">Terms of Carriage</Link>
            <Link href="/admin" className="text-secondary font-medium hover:underline">Internal Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
