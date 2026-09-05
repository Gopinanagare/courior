"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Truck,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  FileSpreadsheet,
} from "lucide-react";

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Loading operations metrics and live cargo telemetry...
      </div>
    );
  }

  const { stats, recentShipments, recentLogs } = data;

  const kpis = [
    {
      label: "Total Consignments",
      value: stats.totalShipments,
      icon: <Package className="w-5 h-5 text-teal-600" />,
      sub: `${stats.booked} Staged / Booked`,
      color: "bg-teal-50 border-teal-200",
    },
    {
      label: "Active In-Transit",
      value: stats.inTransit,
      icon: <Truck className="w-5 h-5 text-blue-600" />,
      sub: `${stats.outForDelivery} Out for Delivery`,
      color: "bg-blue-50 border-blue-200",
    },
    {
      label: "Delivered Consignments",
      value: stats.delivered,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      sub: `${stats.onTimeVelocityRate}% On-Time Velocity`,
      color: "bg-emerald-50 border-emerald-200",
    },
    {
      label: "Total Freight Revenue",
      value: `₹${(stats.totalRevenue || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      icon: <DollarSign className="w-5 h-5 text-purple-600" />,
      sub: `COD: ₹${(stats.totalCod || 0).toLocaleString("en-IN")}`,
      color: "bg-purple-50 border-purple-200",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-bold text-xl sm:text-2xl text-slate-900">
            Operations & Hub Velocity Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Real-time logistics ledger across {stats.activeHubs} regional consolidation hubs and national corridors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/tracking-station"
            className="px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-headline font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Layers className="w-4 h-4" />
            <span>Launch Barcode Scanner</span>
          </Link>
          <Link
            href="/admin/shipments"
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-headline font-semibold text-xs border border-slate-200 transition-colors shadow-xs"
          >
            Manage AWBs
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-xl border ${kpi.color} bg-white shadow-xs flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">{kpi.label}</span>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">{kpi.icon}</div>
            </div>
            <div>
              <p className="font-headline font-black text-2xl text-slate-900">{kpi.value}</p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Section: Recent Dispatches & Live Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Dispatches Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h2 className="font-headline font-bold text-base text-slate-900">
                Recent Consignment Dispatches
              </h2>
              <p className="text-xs text-slate-500">Live outbound manifests and hub staging queue</p>
            </div>
            <Link
              href="/admin/shipments"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>View All Shipments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">AWB</th>
                  <th className="py-2.5 px-3">Corridor</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Weight</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentShipments.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-teal-800">
                      <Link href={`/admin/shipments?q=${encodeURIComponent(s.awb_number)}`} className="hover:underline">
                        {s.awb_number}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-slate-800">{s.sender_city} → {s.recipient_city}</p>
                      <p className="text-[10px] text-slate-400">{s.sender_company || s.sender_name}</p>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{s.service_name}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold">{s.chargeable_weight_kg} kg</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border">
                        {s.status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity Logs (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-headline font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-teal-600" />
              <span>Operational Activity Log</span>
            </h3>
            <span className="text-[10px] font-mono text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded">
              Audited
            </span>
          </div>

          <div className="space-y-3">
            {recentLogs.map((log: any) => (
              <div key={log.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-800">{log.user_name}</span>
                  <span className="font-mono text-slate-400 text-[10px]">{log.created_at?.substring(11, 16)}</span>
                </div>
                <p className="text-slate-600 leading-tight">{log.details}</p>
                <span className="inline-block mt-1 text-[9px] font-mono uppercase text-teal-700 font-bold">
                  {log.action}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/admin/audit-logs"
              className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
            >
              <span>View Full Security Audit Trail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
