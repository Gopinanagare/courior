"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShippingLabelModal from "@/components/ShippingLabelModal";
import {
  Search,
  CheckCircle2,
  Truck,
  Building,
  MapPin,
  Download,
  AlertCircle,
  Clock,
  Shield,
  Phone,
  Layers,
} from "lucide-react";

function TrackContent() {
  const searchParams = useSearchParams();
  const awbFromUrl = searchParams.get("awb") || "EXL-9024881-IN";

  const [awbInput, setAwbInput] = useState(awbFromUrl);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLabelModal, setShowLabelModal] = useState(false);

  useEffect(() => {
    if (awbFromUrl) {
      setAwbInput(awbFromUrl);
      fetchTracking(awbFromUrl);
    }
  }, [awbFromUrl]);

  const fetchTracking = async (awb: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tracking/${encodeURIComponent(awb.trim().toUpperCase())}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Shipment not found.");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to load tracking data.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (awbInput.trim()) {
      fetchTracking(awbInput.trim());
    }
  };

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="w-full bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8">
        <div className="max-w-2xl mx-auto text-center mb-6">
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
            Real-Time Verified Ledger
          </span>
          <h1 className="font-headline font-bold text-2xl sm:text-3xl text-slate-900 mt-1">
            Track Consignment Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enter your unique AWB to inspect facility staging scans, container seals, and scheduled linehaul arrivals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={awbInput}
              onChange={(e) => setAwbInput(e.target.value)}
              placeholder="Enter AWB (e.g. EXL-9024881-IN)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 font-mono text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent bg-slate-50 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-secondary text-white font-headline font-bold text-xs sm:text-sm hover:bg-secondary-hover transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Track</span>
              </>
            )}
          </button>
        </form>

        <div className="max-w-xl mx-auto flex flex-wrap items-center justify-center gap-2 mt-4 text-[11px] text-slate-400">
          <span>Quick Samples:</span>
          <button
            type="button"
            onClick={() => {
              setAwbInput("EXL-9024881-IN");
              fetchTracking("EXL-9024881-IN");
            }}
            className="font-mono text-teal-700 hover:underline"
          >
            EXL-9024881-IN (Active Transit)
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => {
              setAwbInput("EXL-6612044-IN");
              fetchTracking("EXL-6612044-IN");
            }}
            className="font-mono text-teal-700 hover:underline"
          >
            EXL-6612044-IN (Delivered with POD)
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-2xl font-bold text-slate-900">
                    {data.awb}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
                    {data.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Sender: <span className="font-semibold text-slate-800">{data.senderName} ({data.senderCity})</span> → Recipient: <span className="font-semibold text-slate-800">{data.recipientName} ({data.recipientCity})</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowLabelModal(true)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200"
                >
                  <Download className="w-4 h-4 text-teal-600" />
                  <span>Download Manifest & Label</span>
                </button>
              </div>
            </div>

            {/* Pipeline Bar */}
            <div className="pt-6 pb-2">
              <div className="relative flex items-center justify-between max-w-3xl mx-auto px-4">
                <div className="absolute left-8 right-8 h-1 bg-slate-100 top-1/2 -translate-y-1/2"></div>
                <div
                  className="absolute left-8 h-1 bg-secondary top-1/2 -translate-y-1/2 transition-all duration-500"
                  style={{
                    width:
                      data.status === "delivered"
                        ? "calc(100% - 64px)"
                        : data.status === "out_for_delivery"
                        ? "75%"
                        : data.status === "in_transit"
                        ? "50%"
                        : "20%",
                  }}
                ></div>

                {/* Steps */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 mt-1">Booked</span>
                  <span className="text-[10px] text-slate-400">{data.senderCity}</span>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      ["in_transit", "destination_hub", "out_for_delivery", "delivered"].includes(data.status)
                        ? "bg-secondary text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 mt-1">In Transit</span>
                  <span className="text-[10px] text-slate-400">Linehaul</span>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      ["out_for_delivery", "delivered"].includes(data.status)
                        ? "bg-secondary text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Building className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 mt-1">Out For Delivery</span>
                  <span className="text-[10px] text-slate-400">Local Dock</span>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      data.status === "delivered"
                        ? "bg-teal-600 text-white ring-4 ring-teal-100"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 mt-1">Delivered</span>
                  <span className="text-[10px] text-slate-400">{data.recipientCity}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline & Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-headline font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>Verified Facility Custody Ledger</span>
              </h3>

              <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {data.events?.map((ev: any, idx: number) => (
                  <div key={idx} className="relative flex items-start gap-3">
                    <span
                      className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full ring-4 ring-white ${
                        idx === 0 ? "bg-teal-600" : "bg-slate-400"
                      }`}
                    ></span>
                    <div className="flex-1 bg-slate-50 rounded-xl p-3.5 border border-slate-200/60">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900">{ev.title}</span>
                        <span className="font-mono text-[11px] text-teal-700 font-semibold">{ev.event_time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ev.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-mono">
                        {ev.dock_gate && <span className="bg-white px-2 py-0.5 rounded border text-slate-600">Gate: {ev.dock_gate}</span>}
                        {ev.container_seal && <span className="bg-white px-2 py-0.5 rounded border text-slate-600">Seal: {ev.container_seal}</span>}
                        <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200 font-bold">Node: {ev.facility_code || ev.location_city}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 text-xs space-y-2.5">
                <h4 className="font-headline font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
                  Consignment Specs
                </h4>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-semibold text-slate-800">{data.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Package Form:</span>
                  <span className="font-medium uppercase text-slate-800">{data.packageType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chargeable Weight:</span>
                  <span className="font-mono font-bold text-slate-900">{data.chargeableWeightKg} KG</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="text-slate-800">{data.cargoCategory}</span>
                </div>
              </div>

              {data.podRecipientName && (
                <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 text-xs">
                  <h4 className="font-headline font-bold text-sm text-emerald-900 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Proof of Delivery (POD)</span>
                  </h4>
                  <p className="text-slate-700">Received by: <strong className="text-slate-900">{data.podRecipientName}</strong></p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Delivered at: {data.podDeliveredAt}</p>
                  {data.podSignatureUrl && (
                    <img src={data.podSignatureUrl} alt="Signature" className="mt-2 h-12 w-auto bg-white p-1 rounded border border-emerald-200" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showLabelModal && (
        <ShippingLabelModal
          awb={data?.awb}
          shipment={data}
          onClose={() => setShowLabelModal(false)}
        />
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <main className="w-full pt-20 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading tracking engine...</div>}>
          <TrackContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
