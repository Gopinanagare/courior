"use client";

import React, { useState, useEffect } from "react";
import { FileText, DollarSign, CheckCircle2, AlertCircle, Search } from "lucide-react";

export default function AdminInvoicesPage() {
  const [tab, setTab] = useState<"invoices" | "cod">("invoices");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [codShipments, setCodShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === "invoices") {
        const res = await fetch("/api/admin/invoices");
        const json = await res.json();
        if (json.success && json.data) setInvoices(json.data);
      } else {
        const res = await fetch("/api/admin/invoices?type=cod");
        const json = await res.json();
        if (json.success && json.data) setCodShipments(json.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCod = async (shipmentId: number, status: string) => {
    try {
      await fetch("/api/admin/invoices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "cod", id: shipmentId, cod_status: status }),
      });
      fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleUpdateInvoice = async (invoiceId: number, status: string) => {
    try {
      await fetch("/api/admin/invoices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "invoice", id: invoiceId, payment_status: status }),
      });
      fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-bold text-xl sm:text-2xl text-slate-900">
            Invoicing & COD Settlement Hub
          </h1>
          <p className="text-xs text-slate-500">
            Track GST e-invoices, corporate credit accounts, and cash on delivery remittance.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200 border border-slate-300">
          <button
            onClick={() => setTab("invoices")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === "invoices" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Freight Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setTab("cod")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === "cod" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            COD Remittance & Cash ({codShipments.length})
          </button>
        </div>
      </div>

      {tab === "invoices" ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">AWB Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">GST (18%)</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoice_number}</td>
                  <td className="py-3 px-4 font-mono font-bold text-teal-800">{inv.awb_number}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{inv.customer_name || inv.sender_name}</td>
                  <td className="py-3 px-4 font-mono">₹{inv.subtotal?.toFixed(2)}</td>
                  <td className="py-3 px-4 font-mono">₹{inv.tax_amount?.toFixed(2)}</td>
                  <td className="py-3 px-4 font-mono font-bold text-teal-900">₹{inv.total_amount?.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      inv.payment_status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {inv.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {inv.payment_status !== "paid" ? (
                      <button
                        onClick={() => handleUpdateInvoice(inv.id, "paid")}
                        className="px-2.5 py-1 rounded bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200"
                      >
                        Mark Paid
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-semibold">Settled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">AWB</th>
                <th className="py-3 px-4">Recipient & City</th>
                <th className="py-3 px-4">COD Cash Value</th>
                <th className="py-3 px-4">Delivery Status</th>
                <th className="py-3 px-4">COD Collection Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {codShipments.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-teal-800">{c.awb_number}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{c.recipient_name} ({c.recipient_city})</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">₹{c.cod_amount?.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-700">
                      {c.shipment_status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      c.cod_status === "remitted" ? "bg-emerald-50 text-emerald-700" :
                      c.cod_status === "collected" ? "bg-blue-50 text-blue-700" :
                      "bg-amber-50 text-amber-700"
                    }`}>
                      {c.cod_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    {c.cod_status === "pending" && (
                      <button
                        onClick={() => handleUpdateCod(c.id, "collected")}
                        className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      >
                        Collected
                      </button>
                    )}
                    {c.cod_status === "collected" && (
                      <button
                        onClick={() => handleUpdateCod(c.id, "remitted")}
                        className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200"
                      >
                        Remit to Merchant
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
