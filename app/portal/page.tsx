"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Package, Clock, CheckCircle2, AlertCircle, Eye, Download, QrCode, ArrowRight } from "lucide-react";
import ShippingLabelModal from "@/components/ShippingLabelModal";

export default function CustomerShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShipmentForLabel, setSelectedShipmentForLabel] = useState<any>(null);

  useEffect(() => {
    fetchShipments();
  }, [statusFilter, searchQuery]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const url = `/api/customer/shipments?status=${statusFilter}&q=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setShipments(json.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "in_transit":
      case "origin_hub":
      case "destination_hub":
        return "bg-teal-50 text-teal-800 border-teal-200";
      case "out_for_delivery":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "booked":
      case "pickup_scheduled":
        return "bg-amber-50 text-amber-800 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search AWB, Recipient, City..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["all", "booked", "in_transit", "out_for_delivery", "delivered"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? "bg-teal-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Shipments List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading your consignments...</div>
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No shipments found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't booked any shipments under this filter or search query yet.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-white text-xs font-bold hover:bg-secondary-hover"
            >
              <span>Book Your First Consignment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">AWB / Consignment</th>
                  <th className="py-3 px-4">Origin & Destination</th>
                  <th className="py-3 px-4">Service & Specs</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-teal-800">{s.awb_number}</p>
                      <p className="text-[10px] text-slate-400">{s.created_at?.substring(0, 10)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{s.sender_city} → {s.recipient_city}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
                        To: {s.recipient_name} ({s.recipient_pincode})
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{s.service_name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {s.chargeable_weight_kg} KG • {s.package_type}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-slate-900">₹{s.total_amount?.toFixed(2)}</p>
                      <span className="text-[10px] uppercase font-mono text-slate-500">{s.payment_mode}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${getStatusBadge(s.status)}`}>
                        {s.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedShipmentForLabel(s)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                        title="Print e-Way Shipping Label"
                      >
                        <QrCode className="w-4 h-4 text-teal-700" />
                      </button>
                      <Link
                        href={`/track?awb=${encodeURIComponent(s.awb_number)}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 font-semibold text-[11px] border border-teal-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Track</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedShipmentForLabel && (
        <ShippingLabelModal
          awb={selectedShipmentForLabel.awb_number}
          shipment={{
            awb: selectedShipmentForLabel.awb_number,
            senderName: selectedShipmentForLabel.sender_name,
            senderCompany: selectedShipmentForLabel.sender_company,
            senderAddress: selectedShipmentForLabel.sender_address,
            senderCity: selectedShipmentForLabel.sender_city,
            senderState: selectedShipmentForLabel.sender_state,
            senderPincode: selectedShipmentForLabel.sender_pincode,
            senderPhone: selectedShipmentForLabel.sender_phone,
            recipientName: selectedShipmentForLabel.recipient_name,
            recipientCompany: selectedShipmentForLabel.recipient_company,
            recipientAddress: selectedShipmentForLabel.recipient_address,
            recipientCity: selectedShipmentForLabel.recipient_city,
            recipientState: selectedShipmentForLabel.recipient_state,
            recipientPincode: selectedShipmentForLabel.recipient_pincode,
            recipientPhone: selectedShipmentForLabel.recipient_phone,
            serviceName: selectedShipmentForLabel.service_name,
            chargeableWeightKg: selectedShipmentForLabel.chargeable_weight_kg,
            piecesCount: selectedShipmentForLabel.pieces_count,
            dockGate: selectedShipmentForLabel.dock_gate,
          }}
          onClose={() => setSelectedShipmentForLabel(null)}
        />
      )}
    </div>
  );
}
