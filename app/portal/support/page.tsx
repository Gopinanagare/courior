"use client";

import React, { useState, useEffect } from "react";
import { Plus, HelpCircle, MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function CustomerSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [awbNumber, setAwbNumber] = useState("");
  const [category, setCategory] = useState("Delivery Delay");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customer/enquiries");
      const json = await res.json();
      if (json.success && json.data) {
        setTickets(json.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/customer/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          awb_number: awbNumber,
          category,
          subject,
          message,
          priority,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      setIsCreateOpen(false);
      setSubject("");
      setMessage("");
      fetchTickets();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline font-bold text-lg text-slate-900">Support & Enquiries</h2>
          <p className="text-xs text-slate-500">Track inquiries, address change requests, and POD claims directly with hub supervisors.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-secondary text-white text-xs font-bold hover:bg-secondary-hover transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Raise New Ticket</span>
        </button>
      </div>

      {isCreateOpen && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-fadeIn">
          <h3 className="font-headline font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Submit Support Request
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91..."
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Related AWB Number (Optional)</label>
                <input
                  type="text"
                  value={awbNumber}
                  onChange={(e) => setAwbNumber(e.target.value)}
                  placeholder="EXL-9024881-IN"
                  className="w-full px-3 py-2 text-xs font-mono rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inquiry Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 bg-slate-50"
                >
                  <option>Delivery Delay</option>
                  <option>POD Request & Signature</option>
                  <option>Address Modification</option>
                  <option>Tariff & Billing Inquiry</option>
                  <option>Damaged Cargo Claim</option>
                  <option>General Support</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 bg-slate-50"
                >
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent Escalation</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your inquiry"
                className="w-full px-3 py-2 text-xs rounded border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Message Details *</label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide complete consignment context..."
                className="w-full px-3 py-2 text-xs rounded border border-slate-200"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 text-xs rounded border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs rounded bg-secondary text-white font-bold hover:bg-secondary-hover"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {tickets.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No support tickets found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tickets.map((t) => (
              <div key={t.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-800">{t.ticket_number}</span>
                    <span className="text-xs font-bold text-slate-900">{t.subject}</span>
                    {t.awb_number && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 border text-slate-600">
                        AWB: {t.awb_number}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      t.status === "resolved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                      t.status === "in_progress" ? "bg-teal-50 text-teal-700 border border-teal-200" :
                      "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {t.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-slate-400">{t.created_at?.substring(0, 10)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{t.message}</p>

                {t.response_notes && (
                  <div className="mt-3 p-3 rounded-lg bg-teal-50/70 border border-teal-200 text-xs">
                    <span className="font-bold text-teal-900 block mb-0.5">Desk Supervisor Response:</span>
                    <p className="text-teal-800 leading-relaxed">{t.response_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
