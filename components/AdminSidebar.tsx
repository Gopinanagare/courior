"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Grid,
  Package,
  QrCode,
  DollarSign,
  MapPin,
  Building,
  HelpCircle,
  FileText,
  BarChart3,
  Shield,
  Users,
  LogOut,
  ExternalLink,
} from "lucide-react";

interface AdminSidebarProps {
  user: any;
  onLogout: () => void;
}

export default function AdminSidebar({ user, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview & KPIs", href: "/admin", icon: <Grid className="w-4 h-4" /> },
    { label: "Shipments & AWBs", href: "/admin/shipments", icon: <Package className="w-4 h-4" /> },
    { label: "Barcode Scan Station", href: "/admin/tracking-station", icon: <QrCode className="w-4 h-4" /> },
    { label: "Tariff & Rate Matrix", href: "/admin/rates", icon: <DollarSign className="w-4 h-4" /> },
    { label: "Pincode Master", href: "/admin/pincodes", icon: <MapPin className="w-4 h-4" /> },
    { label: "Hub Network", href: "/admin/branches", icon: <Building className="w-4 h-4" /> },
    { label: "Support Tickets", href: "/admin/enquiries", icon: <HelpCircle className="w-4 h-4" /> },
    { label: "Invoices & COD", href: "/admin/invoices", icon: <FileText className="w-4 h-4" /> },
    { label: "Reports & Analytics", href: "/admin/reports", icon: <BarChart3 className="w-4 h-4" /> },
    { label: "Audit Trail", href: "/admin/audit-logs", icon: <Shield className="w-4 h-4" /> },
    { label: "Staff & Users", href: "/admin/users", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Top Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-bold text-xs">
              <svg viewBox="0 0 32 32" className="w-4 h-4" fill="none">
                <path d="M9 16L16 9L23 16L16 23Z" fill="#0F172A" />
                <path d="M16 13L20 16L16 19L12 16Z" fill="#FFFFFF" />
              </svg>
            </div>
            <div>
              <span className="font-headline font-bold text-sm text-white tracking-tight block leading-none">
                EXOLENT <span className="text-teal-400">ADMIN</span>
              </span>
              <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase">
                Operations Engine
              </span>
            </div>
          </Link>
        </div>

        {/* User Identity Pill */}
        {user && (
          <div className="p-3 mx-3 my-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-teal-900/60 text-teal-300 border border-teal-700/50">
                  {user.role.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="p-3 space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Quick Links */}
      <div className="p-3 border-t border-slate-800 space-y-1.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Customer Website</span>
          </span>
          <span className="text-[10px] font-mono text-teal-400">Live</span>
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Admin</span>
        </button>
      </div>
    </aside>
  );
}
