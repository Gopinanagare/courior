"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, Save, ShieldCheck, Percent, Layers } from "lucide-react";

export default function AdminRatesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [rules, setRules] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/rates");
      const json = await res.json();
      if (json.success && json.data) {
        setServices(json.data.services);
        setRules(json.data.rules);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "rules", rules }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      setSuccessMsg("Global tariff rules and surcharges updated successfully.");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveService = async (svc: any) => {
    try {
      const res = await fetch("/api/admin/rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "service", service: svc }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      alert(`Service ${svc.name} tariff updated.`);
      fetchRates();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (loading || !rules) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading tariff rate cards...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline font-bold text-xl sm:text-2xl text-slate-900">
          Tariff Engine & Rate Matrix
        </h1>
        <p className="text-xs text-slate-500">
          Configure base freight multipliers, weight slabs, fuel surcharge adjustments, and goods insurance.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {/* Global Surcharges Rule Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="font-headline font-bold text-base text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Percent className="w-4 h-4 text-teal-600" />
          <span>Global Tariff Surcharges & Taxes</span>
        </h2>

        <form onSubmit={handleSaveRules} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Fuel Surcharge Index (FSC %)</label>
            <input
              type="number"
              step="0.1"
              value={rules.fuel_surcharge_pct}
              onChange={(e) => setRules({ ...rules, fuel_surcharge_pct: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Transit Insurance (% of Value)</label>
            <input
              type="number"
              step="0.05"
              value={rules.insurance_pct}
              onChange={(e) => setRules({ ...rules, insurance_pct: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Minimum Base Insurance Fee (₹)</label>
            <input
              type="number"
              value={rules.min_insurance_fee}
              onChange={(e) => setRules({ ...rules, min_insurance_fee: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Goods & Services Tax (GST %)</label>
            <input
              type="number"
              step="0.5"
              value={rules.gst_pct}
              onChange={(e) => setRules({ ...rules, gst_pct: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">COD Fixed Processing Fee (₹)</label>
            <input
              type="number"
              value={rules.cod_fixed_fee}
              onChange={(e) => setRules({ ...rules, cod_fixed_fee: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono font-bold"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 px-4 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-headline font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Global Surcharges</span>
            </button>
          </div>
        </form>
      </div>

      {/* Services Tariff Cards */}
      <div className="space-y-4">
        <h2 className="font-headline font-bold text-base text-slate-900">
          Courier Service Mode Rates
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((svc) => (
            <div key={svc.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-headline font-bold text-sm text-slate-900">{svc.name}</h3>
                  <span className="text-[10px] font-mono text-slate-400">Code: {svc.code}</span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={svc.is_active === 1}
                    onChange={(e) => {
                      const updated = services.map((s) => s.id === svc.id ? { ...s, is_active: e.target.checked ? 1 : 0 } : s);
                      setServices(updated);
                    }}
                    className="rounded text-teal-700"
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Base Rate (₹)</label>
                  <input
                    type="number"
                    value={svc.base_rate}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setServices(services.map((s) => s.id === svc.id ? { ...s, base_rate: val } : s));
                    }}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Per-KG Rate (₹)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={svc.per_kg_rate}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setServices(services.map((s) => s.id === svc.id ? { ...s, per_kg_rate: val } : s));
                    }}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Volumetric Divisor</label>
                  <input
                    type="number"
                    value={svc.volumetric_divisor}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 5000;
                      setServices(services.map((s) => s.id === svc.id ? { ...s, volumetric_divisor: val } : s));
                    }}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Transit Label</label>
                  <input
                    type="text"
                    value={svc.transit_time_label}
                    onChange={(e) => {
                      const val = e.target.value;
                      setServices(services.map((s) => s.id === svc.id ? { ...s, transit_time_label: val } : s));
                    }}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveService(svc)}
                  className="px-3.5 py-1.5 rounded bg-teal-50 text-teal-800 font-bold border border-teal-200 hover:bg-teal-100 transition-colors"
                >
                  Update Service Tariff
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
