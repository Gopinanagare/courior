"use client";

import React, { useState } from "react";
import { QrCode, Scan, CheckCircle2, AlertCircle, ArrowRight, Layers, Truck, Building } from "lucide-react";

export default function TrackingStationPage() {
  const [scannedAwb, setScannedAwb] = useState("EXL-9024881-IN");
  const [shipmentData, setShipmentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);

  // Milestone fields
  const [milestoneStatus, setMilestoneStatus] = useState("in_transit");
  const [facilityName, setFacilityName] = useState("Pune Linehaul Consolidation Hub");
  const [facilityCode, setFacilityCode] = useState("PNQ-HNJ");
  const [locationCity, setLocationCity] = useState("Pune");
  const [dockGate, setDockGate] = useState("Dock 12");
  const [sealNumber, setSealNumber] = useState("SL-9942");
  const [weightAtGate, setWeightAtGate] = useState(385.2);
  const [remarks, setRemarks] = useState("Automated sorting completed. Staged for Western Corridor linehaul departure.");

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedAwb.trim()) return;
    setLoading(true);
    setError(null);
    setScanSuccess(null);
    try {
      const res = await fetch(`/api/tracking/${encodeURIComponent(scannedAwb.trim().toUpperCase())}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      setShipmentData(json.data);
      setWeightAtGate(json.data.actualWeightKg);
    } catch (err: any) {
      setError(err.message || "AWB barcode not recognized.");
      setShipmentData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipmentData) return;
    setLoading(true);
    setError(null);
    try {
      let title = "";
      if (milestoneStatus === "in_transit") title = "Linehaul Trailer Ingress & Departure";
      else if (milestoneStatus === "destination_hub") title = "Inbound Arrival at Destination Hub";
      else if (milestoneStatus === "out_for_delivery") title = "Assigned & Out for Final Delivery";
      else if (milestoneStatus === "delivered") title = "Consignment Handover Complete";
      else title = "Hub Barcode Milestone Verified";

      const res = await fetch(`/api/admin/shipments/${shipmentData.awb}/tracking-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: milestoneStatus,
          title,
          description: `Facility: ${facilityName} (${facilityCode}). ${remarks}`,
          facility_name: facilityName,
          facility_code: facilityCode,
          location_city: locationCity,
          dock_gate: dockGate,
          container_seal: sealNumber,
          weight_at_gate: weightAtGate,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);

      setScanSuccess(`Barcode Scan Registered! Consignment ${shipmentData.awb} status updated to '${milestoneStatus}'.`);
      // Refresh
      const refreshRes = await fetch(`/api/tracking/${encodeURIComponent(shipmentData.awb)}`);
      const refreshJson = await refreshRes.json();
      if (refreshJson.success) setShipmentData(refreshJson.data);
    } catch (err: any) {
      setError(err.message || "Failed to log milestone scan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-headline font-bold text-xl sm:text-2xl text-slate-900">
          Barcode / Optical Scanner Station
        </h1>
        <p className="text-xs text-slate-500">
          Rapid linehaul barcode verification terminal for sorting centers and hub dock gates.
        </p>
      </div>

      {/* Barcode Input Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Scan className="w-5 h-5 text-teal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={scannedAwb}
              onChange={(e) => setScannedAwb(e.target.value)}
              placeholder="Scan or type AWB (e.g. EXL-9024881-IN)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800 font-mono text-sm font-bold text-teal-300 placeholder:text-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-headline font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan AWB</span>
          </button>
        </form>

        <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400 font-mono">
          <span>Quick Simulator:</span>
          <button type="button" onClick={() => setScannedAwb("EXL-9024881-IN")} className="text-teal-400 underline">EXL-9024881-IN</button>
          <span>•</span>
          <button type="button" onClick={() => setScannedAwb("EXL-89420-EXP")} className="text-teal-400 underline">EXL-89420-EXP</button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {scanSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{scanSuccess}</span>
        </div>
      )}

      {/* Shipment & Scan Form */}
      {shipmentData && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Shipment Card (5 cols) */}
          <div className="md:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-mono font-bold text-sm text-teal-800">{shipmentData.awb}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                {shipmentData.status}
              </span>
            </div>

            <div className="space-y-1.5">
              <p><span className="text-slate-400">Sender:</span> <strong className="text-slate-800">{shipmentData.senderName} ({shipmentData.senderCity})</strong></p>
              <p><span className="text-slate-400">Consignee:</span> <strong className="text-slate-800">{shipmentData.recipientName} ({shipmentData.recipientCity})</strong></p>
              <p><span className="text-slate-400">Service:</span> <span className="font-semibold text-teal-700">{shipmentData.serviceName}</span></p>
              <p><span className="text-slate-400">Chargeable Wt:</span> <span className="font-mono font-bold">{shipmentData.chargeableWeightKg} KG</span></p>
              <p><span className="text-slate-400">Package Form:</span> <span className="uppercase font-mono">{shipmentData.packageType}</span></p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Previous Custody Scans ({shipmentData.events?.length || 0}):</span>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {shipmentData.events?.map((ev: any, i: number) => (
                  <div key={i} className="p-2 rounded bg-slate-50 text-[11px] border border-slate-100">
                    <p className="font-bold text-slate-800">{ev.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{ev.event_time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* New Milestone Logger (7 cols) */}
          <div className="md:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-headline font-bold text-base text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Record Linehaul Event Milestone</span>
            </h3>

            <form onSubmit={handleRegisterScan} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Select Next Operational Stage</label>
                <select
                  value={milestoneStatus}
                  onChange={(e) => setMilestoneStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold bg-slate-50 focus:outline-none"
                >
                  <option value="in_transit">In-Transit on Corridor Trailer</option>
                  <option value="destination_hub">Inbound Arrival at Destination Hub</option>
                  <option value="out_for_delivery">Out for Delivery (Loaded into Van)</option>
                  <option value="delivered">Delivered Successfully (Consignee Handover)</option>
                  <option value="failed">Delivery Exception / Delay</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Facility Name</label>
                  <input
                    type="text"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Facility Node Code</label>
                  <input
                    type="text"
                    value={facilityCode}
                    onChange={(e) => setFacilityCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">City Node</label>
                  <input
                    type="text"
                    value={locationCity}
                    onChange={(e) => setLocationCity(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Dock Gate</label>
                  <input
                    type="text"
                    value={dockGate}
                    onChange={(e) => setDockGate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Container Seal #</label>
                  <input
                    type="text"
                    value={sealNumber}
                    onChange={(e) => setSealNumber(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Scan Remarks & Status Notes</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-headline font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Publish Scan to Public Ledger</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
