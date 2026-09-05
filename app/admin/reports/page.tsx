"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, Download, TrendingUp, Layers, Package, DollarSign } from "lucide-react";

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setReportData(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleExportShipmentReport = () => {
    window.location.href = "/api/admin/shipments?export=true";
  };

  if (loading || !reportData) {
    return <div className="p-12 text-center text-xs text-slate-400">Compiling logistics reports...</div>;
  }

  const { statusCounts, serviceCounts, hubPerformance, paymentBreakdown } = reportData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-bold text-xl sm:text-2xl text-slate-900">
            Operations & Financial Analytics Reports
          </h1>
          <p className="text-xs text-slate-500">
            Volume breakdown, service tier velocity, hub ingress telemetry, and financial revenue.
          </p>
        </div>

        <button
          onClick={handleExportShipmentReport}
          className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-headline font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Master Dataset (CSV)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="font-headline font-bold text-sm text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-teal-600" />
            <span>Consignment Status Distribution</span>
          </h3>
          <div className="space-y-2 text-xs">
            {statusCounts.map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-700 uppercase">{s.status.replace(/_/g, " ")}</span>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-teal-700">{s.count} Packages</span>
                  <span className="font-mono text-slate-600">₹{(s.revenue || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Tier Breakdown */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="font-headline font-bold text-sm text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <span>Courier Service Tiers & Weight</span>
          </h3>
          <div className="space-y-2 text-xs">
            {serviceCounts.map((svc: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">{svc.service_name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Total Wt: {svc.total_weight || 0} KG</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-teal-700">{svc.count} Bookings</p>
                  <p className="font-mono text-[11px] text-slate-600">₹{(svc.revenue || 0).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hub Throughput */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h3 className="font-headline font-bold text-sm text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-600" />
          <span>Hub Ingress & Staging Velocity</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {hubPerformance.map((h: any, i: number) => (
            <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-teal-800">{h.code}</span>
                <span className="text-[10px] text-slate-400">{h.city}</span>
              </div>
              <p className="font-bold text-slate-800 truncate">{h.name}</p>
              <div className="pt-2 flex justify-between text-[11px] text-slate-600">
                <span>Outbound: <strong className="font-mono">{h.outbound_count}</strong></span>
                <span>Inbound: <strong className="font-mono">{h.inbound_count}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
