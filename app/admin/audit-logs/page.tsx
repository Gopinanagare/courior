"use client";

import React, { useState, useEffect } from "react";
import { Shield, Lock, Eye, Calendar, User } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit-logs?limit=100")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setLogs(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline font-bold text-xl sm:text-2xl text-slate-900">
          System Security & Operational Audit Trail
        </h1>
        <p className="text-xs text-slate-500">
          Immutable audit records of all user authentication events, shipment modifications, rate changes, and scan registrations.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading audit trail...</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Staff User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{l.created_at}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{l.user_name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-100 font-bold text-slate-600 border">
                      {l.user_role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-teal-800 text-[11px]">{l.action}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {l.entity_type} {l.entity_id ? `(#${l.entity_id})` : ""}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-md">{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
