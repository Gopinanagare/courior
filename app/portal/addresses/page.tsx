"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, MapPin, Building, Phone, Mail, CheckCircle2 } from "lucide-react";

export default function AddressBookPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [label, setLabel] = useState("");
  const [type, setType] = useState("both");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [gstin, setGstin] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customer/addresses");
      const json = await res.json();
      if (json.success && json.data) {
        setAddresses(json.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await fetch(`/api/customer/addresses?id=${id}`, { method: "DELETE" });
      fetchAddresses();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          type,
          contact_name: contactName,
          phone,
          email,
          company_name: companyName,
          address,
          landmark,
          city,
          state,
          pincode,
          gstin,
          is_default: isDefault ? 1 : 0,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      setIsAddOpen(false);
      fetchAddresses();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline font-bold text-lg text-slate-900">Saved Address Book</h2>
          <p className="text-xs text-slate-500">Save frequent sender facilities and recipient destination warehouses.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-secondary text-white text-xs font-bold hover:bg-secondary-hover transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {isAddOpen && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-fadeIn">
          <h3 className="font-headline font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Create Address Template
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address Label *</label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Bangalore Plant Main Gate"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address Role</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 bg-slate-50"
                >
                  <option value="both">Both (Pickup & Delivery)</option>
                  <option value="sender">Pickup Origin Only</option>
                  <option value="consignee">Delivery Destination Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Facility Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. MedTech Devices"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Contact Name"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91..."
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="facility@company.com"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Building / Street Address"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Landmark</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near Landmark"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded border border-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-secondary focus:ring-0"
                />
                <span>Set as default address template</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs rounded-lg bg-secondary text-white font-bold hover:bg-secondary-hover"
                >
                  Save Address
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {addresses.map((a) => (
          <div
            key={a.id}
            className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-headline font-bold text-sm text-slate-900 truncate">
                  {a.label}
                </span>
                {a.is_default === 1 && (
                  <span className="text-[10px] font-mono bg-teal-50 text-teal-800 px-2 py-0.5 rounded font-bold border border-teal-200 shrink-0">
                    Default
                  </span>
                )}
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">{a.contact_name}</p>
                {a.company_name && <p className="text-[11px] text-slate-500">{a.company_name}</p>}
                <p className="leading-tight mt-1">{a.address}</p>
                <p className="font-bold text-slate-800">
                  {a.city}, {a.state} - {a.pincode}
                </p>
                <p className="text-[11px] text-slate-500 pt-1">Tel: {a.phone}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[10px] uppercase font-mono text-slate-400">
                Role: {a.type}
              </span>
              <button
                onClick={() => handleDelete(a.id)}
                className="text-red-500 hover:text-red-700 p-1 transition-colors"
                title="Delete address"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
