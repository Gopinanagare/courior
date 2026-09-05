"use client";

import React, { useState, useEffect } from "react";
import { HelpCircle, MessageSquare, CheckCircle2, Clock, Send, X, AlertCircle } from "lucide-react";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [newStatus, setNewStatus] = useState("in_progress");

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/enquiries?status=${statusFilter}`);
      const json = await res.json();
      if (json.success && json.data) {
        setEnquiries(json.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const openReplyModal = (t: any) => {
    setSelectedTicket(t);
    setReplyText(t.response_notes || "");
    setNewStatus(t.status === "open" ? "in_progress" : t.status);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      const res = await fetch("/api/admin/enquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTicket.id,
          status: newStatus,
          response_notes: replyText,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      setSelectedTicket(null);
      fetchEnquiries();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-bold text-xl sm:text-2xl text-slate-900">
            Customer Support & Enquiry Triage
          </h1>
          <p className="text-xs text-slate-500">
            Respond to customer ticket inquiries, delivery delay claims, and address modifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["all", "open", "in_progress", "resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                statusFilter === st
                  ? "bg-teal-700 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {st.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading support tickets...</div>
        ) : enquiries.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No tickets found in this filter.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ticket Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Subject & Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enquiries.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-mono font-bold text-teal-800">{t.ticket_number}</p>
                    <p className="text-[10px] text-slate-400">{t.created_at?.substring(0, 10)}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800">{t.name}</p>
                    <p className="text-[10px] text-slate-500">{t.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800">{t.subject}</p>
                    <p className="text-[10px] text-slate-500">
                      Category: {t.category} {t.awb_number ? `• AWB: ${t.awb_number}` : ""}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      t.priority === "urgent" ? "bg-red-50 text-red-700" :
                      t.priority === "high" ? "bg-amber-50 text-amber-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      t.status === "resolved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      t.status === "in_progress" ? "bg-teal-50 text-teal-700 border-teal-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {t.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openReplyModal(t)}
                      className="px-3 py-1 rounded bg-teal-50 text-teal-800 font-bold border border-teal-200 hover:bg-teal-100"
                    >
                      Reply / Triage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Triage Ticket {selectedTicket.ticket_number}
                </h3>
                <p className="text-slate-500">{selectedTicket.subject}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg space-y-1 mb-4 border border-slate-100">
              <p><span className="text-slate-400">Customer Message:</span></p>
              <p className="text-slate-700 italic">{selectedTicket.message}</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Ticket Resolution Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-bold bg-slate-50"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Operations Response Notes (Visible to Customer) *</label>
                <textarea
                  rows={3}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to the customer..."
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-1.5 rounded border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-teal-700 text-white font-bold hover:bg-teal-800"
                >
                  Save Response & Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
