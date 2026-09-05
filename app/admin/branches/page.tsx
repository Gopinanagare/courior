"use client";

import React, { useState, useEffect } from "react";
import { Building, Plus, MapPin, Phone, ShieldCheck, X } from "lucide-react";

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [dockGates, setDockGates] = useState(12);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/branches");
      const json = await res.json();
      if (json.success && json.data) {
        setBranches(json.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          name,
          city,
          state,
          pincode,
          address,
          dock_gates: dockGates,
          contact_name: contactName,
          contact_phone: contactPhone,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      setIsAddOpen(false);
      fetchBranches();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-bold text-xl sm:text-2xl text-slate-900">
            Hub & Branch Facility Management
          </h1>
          <p className="text-xs text-slate-500">
            Configure sorting terminals, dock bay allocations, and facility managers across India.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-headline font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Hub</span>
        </button>
      </div>

      {isAddOpen && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h3 className="font-headline font-bold text-sm text-slate-900">Add Logistics Terminal Facility</h3>
            <button onClick={() => setIsAddOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
          </div>

          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">Hub Node Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. AMD-SAN"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-mono font-bold uppercase"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Hub Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ahmedabad Sanand Logistics Park"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
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
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Full Facility Street Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Warehouse Complex, Plot Number, Industrial Area"
                className="w-full px-2.5 py-1.5 rounded border border-slate-200"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">Dock Gates Count</label>
                <input
                  type="number"
                  value={dockGates}
                  onChange={(e) => setDockGates(parseInt(e.target.value) || 4)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Facility Incharge Name *</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Incharge Phone *</label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                />
              </div>
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
                Save Facility Hub
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Branches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {branches.map((b) => (
          <div key={b.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {b.code}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {b.dock_gates} Dock Bays
                </span>
              </div>

              <h3 className="font-headline font-bold text-sm text-slate-900 leading-tight">
                {b.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{b.address}</p>

              <div className="mt-3 p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Manager:</span>
                  <span className="font-semibold text-slate-800">{b.contact_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-mono text-slate-800">{b.contact_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Consignments Handled:</span>
                  <span className="font-mono font-bold text-teal-700">{b.total_shipments_handled || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
