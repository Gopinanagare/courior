"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Grid, User, LogOut, Package, MapPin, Calculator, Truck, HelpCircle, Shield } from "lucide-react";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [quickAwb, setQuickAwb] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setIsUserMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickAwb.trim()) {
      router.push(`/track?awb=${encodeURIComponent(quickAwb.trim().toUpperCase())}`);
    }
  };

  const navLinks = [
    { label: "Track Shipment", href: "/track" },
    { label: "Book Pickup", href: "/book" },
    { label: "Rate Calculator", href: "/rate-calculator" },
    { label: "Services", href: "/services" },
    { label: "Network Hubs", href: "/network-hubs" },
  ];

  const isAdminRole = user && ["super_admin", "operations", "branch_manager", "support", "accounts"].includes(user.role);

  return (
    <>
      <header className="fixed top-0 w-full z-40 bg-surface/90 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
        <div className="h-16 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-xs">
                <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
                  <path d="M9 16L16 9L23 16L16 23Z" fill="#14B8A6" fillOpacity="0.9" />
                  <path d="M16 13L20 16L16 19L12 16Z" fill="#F8FAFC" />
                  <circle cx="21" cy="21" r="2.5" fill="#38BDF8" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-bold text-base text-on-surface tracking-tight leading-none group-hover:text-secondary transition-colors">
                  EXOLENT <span className="text-secondary font-semibold">EXPRESS</span>
                </span>
                <span className="text-[9px] font-mono-data tracking-wider text-slate-500 uppercase">
                  Logistics & Transit
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-on-surface font-semibold bg-surface-container-high"
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Track Input */}
            <form onSubmit={handleQuickTrack} className="hidden md:flex items-center bg-surface-container-low rounded-lg px-3 py-1.5 w-60 lg:w-72 border border-slate-200/50 shadow-inner">
              <Search className="w-4 h-4 text-outline mr-2 shrink-0" />
              <input
                type="text"
                value={quickAwb}
                onChange={(e) => setQuickAwb(e.target.value)}
                placeholder="Quick track AWB / Ref..."
                className="bg-transparent w-full font-mono-data text-xs text-on-surface placeholder:text-outline focus:outline-none"
              />
            </form>

            {/* Admin Portal Shortcut */}
            {isAdminRole ? (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-semibold border border-slate-200 transition-all shadow-xs"
              >
                <Grid className="w-3.5 h-3.5 text-secondary" />
                <span>Admin Operations</span>
              </Link>
            ) : (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-secondary" />
                <span>Staff Portal</span>
              </Link>
            )}

            {/* User Profile / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-surface-container hover:bg-surface-container-high transition-all border border-slate-200"
                >
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-on-surface max-w-[100px] truncate hidden sm:inline-block">
                    {user.name.split(" ")[0]}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono-data uppercase bg-teal-50 text-teal-700 border border-teal-200">
                        {user.role.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/portal"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>My Shipments & Bookings</span>
                      </Link>
                      <Link
                        href="/portal/addresses"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>Saved Address Book</span>
                      </Link>
                      <Link
                        href="/portal/support"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                        <span>Customer Support Tickets</span>
                      </Link>

                      {isAdminRole && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-secondary font-semibold hover:bg-teal-50 border-t border-slate-100"
                        >
                          <Grid className="w-4 h-4" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          if (["super_admin", "operations", "branch_manager", "support", "accounts"].includes(loggedUser.role)) {
            router.push("/admin");
          } else {
            router.push("/portal");
          }
        }}
      />
    </>
  );
}
