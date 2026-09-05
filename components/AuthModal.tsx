"use client";

import React, { useState } from "react";
import { X, Lock, Mail, User, Phone, Building, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  initialMode?: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email, password }
          : { name, email, password, phone, company_name: companyName, role: "customer" };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Authentication failed.");
      }

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Quick Demo Login credentials
  const demoAccounts = [
    { role: "Super Admin", email: "admin@exolent.com", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { role: "Operations Lead", email: "ops@exolent.com", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { role: "Branch Manager (BLR)", email: "branch@exolent.com", color: "bg-teal-100 text-teal-800 border-teal-200" },
    { role: "Customer Support", email: "support@exolent.com", color: "bg-amber-100 text-amber-800 border-amber-200" },
    { role: "Accounts & Billing", email: "accounts@exolent.com", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    { role: "Customer (MedTech)", email: "customer@medtech.com", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  ];

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setMode("login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-primary text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wider uppercase text-secondary-fixed">
              Exolent Access Gateway
            </span>
          </div>
          <h2 className="text-xl font-bold font-headline">
            {mode === "login" ? "Sign In to Exolent Express" : "Create Enterprise Account"}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {mode === "login"
              ? "Access consignment dispatching, tracking ledger, and analytics."
              : "Register to manage multi-parcel shipments, saved hubs, and invoices."}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98450..."
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Company (Optional)</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Organization Name"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-secondary hover:bg-secondary-hover text-white font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{mode === "login" ? "Sign In" : "Complete Registration"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
              }}
              className="text-xs text-secondary font-medium hover:underline"
            >
              {mode === "login"
                ? "Don't have an account? Register as Customer"
                : "Already registered? Sign in here"}
            </button>
          </div>

          {/* Quick Demo Logins */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
              <span>Quick Test Accounts (Click to Fill)</span>
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {demoAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickLogin(acc.email)}
                  className={`text-left p-1.5 rounded-lg border text-[11px] transition-all hover:scale-[1.02] ${acc.color}`}
                >
                  <p className="font-semibold truncate">{acc.role}</p>
                  <p className="text-[10px] opacity-75 truncate">{acc.email}</p>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Default password for all demo accounts: <code className="font-mono text-slate-600">password123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
