"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, MapPin, Trash2, CheckCircle2, X } from "lucide-react";

export default function AdminPincodesPage() {
  const [pincodes, setPincodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zone, setZone] = useState("South");
  const [hubId, setHubId] = useState(1);
  const [isServiceable, setIsServiceable] = useState(true);
  const [isCodAllowed, setIsCodAllowed] = useState(true);
  const [isColdAllowed, setIsColdAllowed] = useState(true);

  useEffect(() => {
    fetchPincodes();
  }, [query]);

  const fetchPincodes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pincodes?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setPincodes(json.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSavePincode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/pincodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pincode,
          city,
          state,
          zone,
          hub_id: hubId,
          is_serviceable: isServiceable ? 1 : 0,
          is_cod_allowed: isCodAllowed ? 1 : 0,
          is_cold_chain_allowed: isColdAllowed ? 1 : 0,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      setIsAddOpen(false);
      fetchPincodes();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (pin: string) => {
    if (!confirm(`Delete pincode ${pin}?`)) return;
    try {
      await fetch(`/api/admin/pincodes?pincode=${pin}`, { method: "DELETE" });
      fetchPincodes();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-bold text-xl sm:text-2xl text-slate-900">
            Pincode & Serviceability Master
          </h1>
          <p className="text-xs text-slate-500">
            Manage 19,000+ supportable postal zones, COD availability, and regional hub assignments.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-headline font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Pincode</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Pincode, City, State..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {isAddOpen && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h3 className="font-headline font-bold text-sm text-slate-900">Register Postal Code</h3>
            <button onClick={() => setIsAddOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
          </div>

          <form onSubmit={handleSavePincode} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 560066"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Bangalore"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Karnataka"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Zone *</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-slate-50"
                >
                  <option>South</option>
                  <option>West</option>
                  <option>North</option>
                  <option>East</option>
                  <option>Central</option>
                  <option>North-East</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isServiceable}
                  onChange={(e) => setIsServiceable(e.target.checked)}
                  className="rounded text-teal-700"
                />
                <span>Serviceable Express</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCodAllowed}
                  onChange={(e) => setIsCodAllowed(e.target.checked)}
                  className="rounded text-teal-700"
                />
                <span>COD Permitted</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isColdAllowed}
                  onChange={(e) => setIsColdAllowed(e.target.checked)}
                  className="rounded text-teal-700"
                />
                <span>Cold Chain Delivery Allowed</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-1.5 rounded border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-teal-700 text-white font-bold"
              >
                Save Pincode
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pincodes Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Pincode</th>
              <th className="py-3 px-4">City & State</th>
              <th className="py-3 px-4">Zone</th>
              <th className="py-3 px-4">Assigned Hub</th>
              <th className="py-3 px-4">Capabilities</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pincodes.map((p) => (
              <tr key={p.pincode} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-teal-800 text-xs">{p.pincode}</td>
                <td className="py-3 px-4">
                  <p className="font-semibold text-slate-800">{p.city}</p>
                  <p className="text-[10px] text-slate-400">{p.state}</p>
                </td>
                <td className="py-3 px-4 font-medium text-slate-700">{p.zone}</td>
                <td className="py-3 px-4">
                  <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 border">
                    {p.hub_name || "Regional Hub"}
                  </span>
                </td>
                <td className="py-3 px-4 space-x-1">
                  {p.is_cod_allowed === 1 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                      COD
                    </span>
                  )}
                  {p.is_cold_chain_allowed === 1 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                      COLD
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    p.is_serviceable === 1 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                  }`}>
                    {p.is_serviceable === 1 ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDelete(p.pincode)}
                    className="p-1 rounded hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
