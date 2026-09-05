"use client";

import React, { useState, useEffect } from "react";
import { User, Building, Mail, Phone, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading profile data...</div>;
  }

  return (
    <div className="max-w-2xl bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-6">
      <div>
        <h2 className="font-headline font-bold text-lg text-slate-900">Account & Billing Profile</h2>
        <p className="text-xs text-slate-500">Corporate tax identifier, contact details, and account credentials.</p>
      </div>

      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Full Name</span>
            <span className="font-semibold text-slate-800 text-sm">{user?.name || "Customer User"}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Email Address</span>
            <span className="font-mono text-slate-800 text-sm">{user?.email || "customer@medtech.com"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Company / Facility</span>
            <span className="font-semibold text-slate-800 text-sm">{user?.company_name || "MedTech Devices Bangalore"}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">GSTIN Number</span>
            <span className="font-mono text-teal-800 font-bold text-sm">{user?.gstin || "29AABCE8942N1ZG"}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Phone Number</span>
          <span className="font-mono text-slate-800">{user?.phone || "+91 98450 11982"}</span>
        </div>

        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-teal-900 text-xs">Verified Corporate Account</p>
            <p className="text-teal-800 text-[11px] mt-0.5 leading-relaxed">
              Your account is authorized for corporate credit billing, automated invoice generation, and preferred gate dock allocations at regional hubs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
