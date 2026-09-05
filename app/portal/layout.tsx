"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Package, MapPin, HelpCircle, User, ArrowLeft, PlusCircle, LogOut } from "lucide-react";

export default function CustomerPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          // If not logged in, prompt or redirect
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const links = [
    { label: "My Shipments", href: "/portal", icon: <Package className="w-4 h-4" /> },
    { label: "Saved Addresses", href: "/portal/addresses", icon: <MapPin className="w-4 h-4" /> },
    { label: "Support Tickets", href: "/portal/support", icon: <HelpCircle className="w-4 h-4" /> },
    { label: "Account Profile", href: "/portal/profile", icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      <div className="pt-20 pb-16 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex-1">
        {/* Portal Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
              {user ? user.name.charAt(0).toUpperCase() : "C"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline font-bold text-lg sm:text-xl text-slate-900">
                  {user ? user.name : "Customer Portal"}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-teal-50 text-teal-800 border border-teal-200 uppercase">
                  {user?.company_name || "Verified Merchant"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {user?.email || "Manage your consignments, invoices, and saved delivery addresses."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/book"
              className="px-4 py-2 rounded-lg bg-secondary text-white font-headline font-bold text-xs hover:bg-secondary-hover transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book New Shipment</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 border-b border-slate-200">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Main Portal View */}
        <div>{children}</div>
      </div>
    </div>
  );
}
