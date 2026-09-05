"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import AuthModal from "@/components/AuthModal";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success && data.user) {
        if (["super_admin", "operations", "branch_manager", "support", "accounts"].includes(data.user.role)) {
          setUser(data.user);
        } else {
          setUser(null);
          setIsAuthOpen(true);
        }
      } else {
        setUser(null);
        setIsAuthOpen(true);
      }
    } catch {
      setUser(null);
      setIsAuthOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-teal-400 mt-4 tracking-wider uppercase">
          Authenticating Operations Session...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-950 rounded-2xl p-8 border border-slate-800 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto border border-teal-500/20">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="font-headline font-bold text-xl text-white">
            Exolent Express Operations Portal
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Restricted access for Super Admins, Operations, Branch Managers, Accounts, and Support Personnel.
          </p>
          <button
            onClick={() => setIsAuthOpen(true)}
            className="w-full py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-headline font-bold text-xs transition-colors shadow-sm"
          >
            Authenticate Admin Credentials
          </button>
        </div>

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => {
            if (!user) router.push("/");
          }}
          onSuccess={(loggedUser) => {
            if (["super_admin", "operations", "branch_manager", "support", "accounts"].includes(loggedUser.role)) {
              setUser(loggedUser);
              setIsAuthOpen(false);
            } else {
              alert("Your account role does not have administrative access.");
              router.push("/portal");
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <AdminSidebar user={user} onLogout={handleLogout} />

      {/* Main Admin Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} />
        <main className="p-6 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
