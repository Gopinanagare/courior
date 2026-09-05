"use client";

import React, { useState, useEffect } from "react";
import { Search, Bell, Shield, MapPin } from "lucide-react";

interface AdminHeaderProps {
  user: any;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("all");

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.branches) {
          setBranches(data.branches);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-4">
        {/* Hub Scoping Dropdown */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Regional Staging Hubs (Pan-India)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} - {b.name} ({b.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Live operational status pulse */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Central Gateway Online</span>
        </div>

        {/* User Role Badge */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <span className="text-xs font-bold text-slate-700 hidden md:inline-block">
              {user.name}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-bold border">
              {user.role}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
