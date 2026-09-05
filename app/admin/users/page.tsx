"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, Shield, CheckCircle2, Lock, X } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("operations");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [branchId, setBranchId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchBranches();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (json.success && json.data) setUsers(json.data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await fetch("/api/admin/branches");
      const json = await res.json();
      if (json.success && json.data) setBranches(json.data);
    } catch {}
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          phone,
          company_name: companyName,
          branch_id: branchId || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      setIsAddOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      fetchUsers();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleToggleActive = async (u: any) => {
    try {
      await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: u.id,
          name: u.name,
          role: u.role,
          phone: u.phone,
          company_name: u.company_name,
          branch_id: u.branch_id,
          is_active: u.is_active === 1 ? 0 : 1,
        }),
      });
      fetchUsers();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-bold text-xl sm:text-2xl text-slate-900">
            Staff & User Role Permissions
          </h1>
          <p className="text-xs text-slate-500">
            Manage administrative personnel, operations staff, branch managers, support reps, and customer access.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-headline font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Account</span>
        </button>
      </div>

      {isAddOpen && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h3 className="font-headline font-bold text-sm text-slate-900">Create Staff User</h3>
            <button onClick={() => setIsAddOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Staff Name"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@exolent.com"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">Role Permission *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-bold bg-slate-50"
                >
                  <option value="super_admin">Super Admin (Full Access)</option>
                  <option value="operations">Operations Lead (Dispatch & Scans)</option>
                  <option value="branch_manager">Branch Manager (Scoped Hub)</option>
                  <option value="support">Customer Support (Ticket Triage)</option>
                  <option value="accounts">Accounts & Billing (Invoices/COD)</option>
                  <option value="customer">Customer / Merchant</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Scoped Branch Hub (Optional)</label>
                <select
                  value={branchId || ""}
                  onChange={(e) => setBranchId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-slate-50"
                >
                  <option value="">None / Corporate HQ</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91..."
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
                className="px-4 py-1.5 rounded bg-teal-700 text-white font-bold hover:bg-teal-800"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">User Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Assigned Branch</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                <td className="py-3 px-4 font-mono text-slate-700">{u.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    u.role === "super_admin" ? "bg-purple-50 text-purple-800 border border-purple-200" :
                    u.role === "operations" ? "bg-blue-50 text-blue-800 border border-blue-200" :
                    u.role === "branch_manager" ? "bg-teal-50 text-teal-800 border border-teal-200" :
                    u.role === "support" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                    u.role === "accounts" ? "bg-indigo-50 text-indigo-800 border border-indigo-200" :
                    "bg-slate-100 text-slate-700"
                  }`}>
                    {u.role.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-slate-600 font-mono text-[11px]">
                    {u.branch_code ? `${u.branch_code} - ${u.branch_name}` : "All Branches"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    u.is_active === 1 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                  }`}>
                    {u.is_active === 1 ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleToggleActive(u)}
                    className="px-2 py-1 text-[11px] font-semibold rounded border border-slate-200 hover:bg-slate-100"
                  >
                    {u.is_active === 1 ? "Deactivate" : "Activate"}
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
