"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Download,
  Upload,
  QrCode,
  Truck,
  Layers,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit,
  Eye,
  Filter,
  FileSpreadsheet,
  X,
  MapPin,
  Building,
  User,
  Phone,
  ShieldCheck,
} from "lucide-react";
import ShippingLabelModal from "@/components/ShippingLabelModal";

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isPodOpen, setIsPodOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [activeShipment, setActiveShipment] = useState<any>(null);
  const [selectedForLabel, setSelectedForLabel] = useState<any>(null);

  // New Shipment / Edit Shipment Form State (Full Pickup & Drop Address)
  const [formAwb, setFormAwb] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderCompany, setSenderCompany] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [senderLandmark, setSenderLandmark] = useState("");
  const [senderCity, setSenderCity] = useState("Bangalore");
  const [senderState, setSenderState] = useState("Karnataka");
  const [senderPincode, setSenderPincode] = useState("560066");
  const [senderGstin, setSenderGstin] = useState("");

  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientCompany, setRecipientCompany] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientLandmark, setRecipientLandmark] = useState("");
  const [recipientCity, setRecipientCity] = useState("Mumbai");
  const [recipientState, setRecipientState] = useState("Maharashtra");
  const [recipientPincode, setRecipientPincode] = useState("400072");

  const [serviceCode, setServiceCode] = useState("cargo");
  const [packageType, setPackageType] = useState("carton");
  const [cargoCategory, setCargoCategory] = useState("General Cargo");
  const [actualWeight, setActualWeight] = useState(10);
  const [lengthCm, setLengthCm] = useState(30);
  const [widthCm, setWidthCm] = useState(25);
  const [heightCm, setHeightCm] = useState(20);
  const [declaredValue, setDeclaredValue] = useState(5000);
  const [paymentMode, setPaymentMode] = useState("prepaid");
  const [codAmount, setCodAmount] = useState(0);
  const [dockGate, setDockGate] = useState("Gate 1");
  const [assignedDriver, setAssignedDriver] = useState("");
  const [assignedVehicle, setAssignedVehicle] = useState("");
  const [pickupSlot, setPickupSlot] = useState("14:00 - 16:30 IST");
  const [status, setStatus] = useState("booked");

  // Tracking Scan Form State
  const [scanStatus, setScanStatus] = useState("in_transit");
  const [scanTitle, setScanTitle] = useState("Departed Origin Hub on Linehaul Trailer");
  const [scanDesc, setScanDesc] = useState("Consignment loaded into scheduled trailer and departed hub.");
  const [scanFacility, setScanFacility] = useState("Bangalore Regional Sorting Center");
  const [scanFacilityCode, setScanFacilityCode] = useState("BLR-WFD");
  const [scanCity, setScanCity] = useState("Bangalore");
  const [scanDockGate, setScanDockGate] = useState("Gate 4");
  const [scanSeal, setScanSeal] = useState("SL-9941");
  const [scanWeight, setScanWeight] = useState(10);

  // POD Form State
  const [podRecipientName, setPodRecipientName] = useState("");
  const [podRemarks, setPodRemarks] = useState("Delivered in good condition with container seal intact.");
  const [podCodCollected, setPodCodCollected] = useState(true);

  // CSV Import state
  const [importCsvText, setImportCsvText] = useState("");

  useEffect(() => {
    fetchShipments();
  }, [searchQuery, statusFilter, serviceFilter, page]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/shipments?page=${page}&limit=15&status=${statusFilter}&service=${serviceFilter}&q=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setShipments(json.data);
        setPagination(json.pagination);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormAwb("");
    setSenderName("");
    setSenderPhone("");
    setSenderEmail("");
    setSenderCompany("");
    setSenderAddress("");
    setSenderLandmark("");
    setSenderCity("Bangalore");
    setSenderState("Karnataka");
    setSenderPincode("560066");
    setSenderGstin("");

    setRecipientName("");
    setRecipientPhone("");
    setRecipientEmail("");
    setRecipientCompany("");
    setRecipientAddress("");
    setRecipientLandmark("");
    setRecipientCity("Mumbai");
    setRecipientState("Maharashtra");
    setRecipientPincode("400072");

    setActualWeight(10);
    setAssignedDriver("");
    setAssignedVehicle("");
    setDockGate("Gate 1");
    setIsCreateOpen(true);
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          custom_awb: formAwb || undefined,
          sender_name: senderName,
          sender_phone: senderPhone,
          sender_email: senderEmail,
          sender_company: senderCompany,
          sender_address: senderAddress,
          sender_landmark: senderLandmark,
          sender_city: senderCity,
          sender_state: senderState,
          sender_pincode: senderPincode,
          sender_gstin: senderGstin,

          recipient_name: recipientName,
          recipient_phone: recipientPhone,
          recipient_email: recipientEmail,
          recipient_company: recipientCompany,
          recipient_address: recipientAddress,
          recipient_landmark: recipientLandmark,
          recipient_city: recipientCity,
          recipient_state: recipientState,
          recipient_pincode: recipientPincode,

          service_code: serviceCode,
          package_type: packageType,
          cargo_category: cargoCategory,
          actual_weight_kg: actualWeight,
          length_cm: lengthCm,
          width_cm: widthCm,
          height_cm: heightCm,
          declared_value: declaredValue,
          payment_mode: paymentMode,
          cod_amount: codAmount,
          dock_gate: dockGate,
          assigned_driver: assignedDriver,
          assigned_vehicle: assignedVehicle,
          pickup_slot: pickupSlot,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);

      setIsCreateOpen(false);
      fetchShipments();
      alert(`Consignment ${json.data.awb} created successfully!`);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const openEditModal = (s: any) => {
    setActiveShipment(s);
    setSenderName(s.sender_name);
    setSenderPhone(s.sender_phone);
    setSenderEmail(s.sender_email || "");
    setSenderCompany(s.sender_company || "");
    setSenderAddress(s.sender_address);
    setSenderLandmark(s.sender_landmark || "");
    setSenderCity(s.sender_city);
    setSenderState(s.sender_state || "");
    setSenderPincode(s.sender_pincode);

    setRecipientName(s.recipient_name);
    setRecipientPhone(s.recipient_phone);
    setRecipientEmail(s.recipient_email || "");
    setRecipientCompany(s.recipient_company || "");
    setRecipientAddress(s.recipient_address);
    setRecipientLandmark(s.recipient_landmark || "");
    setRecipientCity(s.recipient_city);
    setRecipientState(s.recipient_state || "");
    setRecipientPincode(s.recipient_pincode);

    setStatus(s.status);
    setAssignedDriver(s.assigned_driver || "");
    setAssignedVehicle(s.assigned_vehicle || "");
    setDockGate(s.dock_gate || "Gate 1");
    setPickupSlot(s.pickup_slot || "14:00 - 16:30 IST");
    setIsEditOpen(true);
  };

  const handleUpdateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShipment) return;
    try {
      const res = await fetch(`/api/admin/shipments/${activeShipment.awb_number}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_name: senderName,
          sender_phone: senderPhone,
          sender_email: senderEmail,
          sender_company: senderCompany,
          sender_address: senderAddress,
          sender_landmark: senderLandmark,
          sender_city: senderCity,
          sender_state: senderState,
          sender_pincode: senderPincode,

          recipient_name: recipientName,
          recipient_phone: recipientPhone,
          recipient_email: recipientEmail,
          recipient_company: recipientCompany,
          recipient_address: recipientAddress,
          recipient_landmark: recipientLandmark,
          recipient_city: recipientCity,
          recipient_state: recipientState,
          recipient_pincode: recipientPincode,

          status,
          assigned_driver: assignedDriver,
          assigned_vehicle: assignedVehicle,
          dock_gate: dockGate,
          pickup_slot: pickupSlot,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);

      setIsEditOpen(false);
      fetchShipments();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const openScanModal = (s: any) => {
    setActiveShipment(s);
    setScanStatus("in_transit");
    setScanTitle("Cross-Dock Linehaul Transit Scan");
    setScanDesc(`Consignment scanned at ${s.sender_city} Hub for transit to ${s.recipient_city}.`);
    setScanFacility("Regional Transit Center");
    setScanFacilityCode("HUB-TRANSIT");
    setScanCity(s.sender_city);
    setScanDockGate(s.dock_gate || "Gate 2");
    setScanSeal(`SL-${Math.floor(1000 + Math.random() * 9000)}`);
    setScanWeight(s.actual_weight_kg);
    setIsScanOpen(true);
  };

  const handleSaveScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShipment) return;
    try {
      const res = await fetch(`/api/admin/shipments/${activeShipment.awb_number}/tracking-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: scanStatus,
          title: scanTitle,
          description: scanDesc,
          facility_name: scanFacility,
          facility_code: scanFacilityCode,
          location_city: scanCity,
          dock_gate: scanDockGate,
          container_seal: scanSeal,
          weight_at_gate: scanWeight,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);

      setIsScanOpen(false);
      fetchShipments();
      alert(`Tracking event logged for ${activeShipment.awb_number}!`);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const openPodModal = (s: any) => {
    setActiveShipment(s);
    setPodRecipientName(s.recipient_name);
    setPodRemarks("Delivered in pristine condition with intact container seals.");
    setPodCodCollected(s.payment_mode === "cod");
    setIsPodOpen(true);
  };

  const handleSavePod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShipment) return;
    try {
      const res = await fetch(`/api/admin/shipments/${activeShipment.awb_number}/pod`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pod_recipient_name: podRecipientName,
          remarks: podRemarks,
          cod_collected: podCodCollected,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);

      setIsPodOpen(false);
      fetchShipments();
      alert(`Proof of Delivery recorded. Consignment ${activeShipment.awb_number} marked Delivered!`);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteShipment = async (awb: string) => {
    if (!confirm(`Are you sure you want to permanently delete consignment ${awb}?`)) return;
    try {
      const res = await fetch(`/api/admin/shipments/${awb}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      fetchShipments();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleExportCsv = () => {
    window.location.href = `/api/admin/shipments?export=true&status=${statusFilter}&service=${serviceFilter}&q=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-bold text-xl sm:text-2xl text-slate-900">
            Consignment & AWB Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Create, search, inspect, assign linehaul drivers, log warehouse scans, and upload POD proofs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-headline font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Shipment</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search AWB, Sender, Recipient, Driver, City..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs font-semibold text-slate-700 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="booked">Booked</option>
            <option value="pickup_scheduled">Pickup Scheduled</option>
            <option value="picked_up">Picked Up</option>
            <option value="in_transit">In Transit</option>
            <option value="destination_hub">At Dest Hub</option>
            <option value="out_for_delivery">Out For Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed Delivery</option>
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => {
              setServiceFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs font-semibold text-slate-700 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
          >
            <option value="all">All Services</option>
            <option value="cargo">Express Cargo</option>
            <option value="standard">Surface Standard</option>
            <option value="cold">Cold Chain</option>
            <option value="intl">International</option>
            <option value="hyper">Hyperlocal</option>
          </select>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading consignments...</div>
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No shipments match your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">AWB & Date</th>
                  <th className="py-3 px-4">Origin / Consignor</th>
                  <th className="py-3 px-4">Destination / Consignee</th>
                  <th className="py-3 px-4">Service & Specs</th>
                  <th className="py-3 px-4">Driver / Vehicle</th>
                  <th className="py-3 px-4">Freight & COD</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-teal-800 text-xs">{s.awb_number}</p>
                      <p className="text-[10px] text-slate-400">{s.created_at?.substring(0, 16)}</p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{s.sender_city} ({s.sender_pincode})</p>
                      <p className="text-[10px] text-slate-600 truncate max-w-[150px]">{s.sender_name}</p>
                      {s.sender_company && <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{s.sender_company}</p>}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{s.recipient_city} ({s.recipient_pincode})</p>
                      <p className="text-[10px] text-slate-600 truncate max-w-[150px]">{s.recipient_name}</p>
                      {s.recipient_company && <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{s.recipient_company}</p>}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{s.service_name}</p>
                      <p className="text-[10px] font-mono text-slate-500">
                        {s.chargeable_weight_kg} KG • {s.package_type}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      {s.assigned_driver ? (
                        <div>
                          <p className="font-medium text-slate-800">{s.assigned_driver}</p>
                          <p className="text-[10px] font-mono text-slate-500">{s.assigned_vehicle || "Van"}</p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-slate-900">₹{s.total_amount?.toFixed(2)}</p>
                      <span className="text-[10px] uppercase font-mono text-slate-500">
                        {s.payment_mode} {s.cod_amount > 0 ? `(COD ₹${s.cod_amount})` : ""}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        s.status === "delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        s.status === "out_for_delivery" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        s.status === "in_transit" ? "bg-teal-50 text-teal-800 border-teal-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {s.status.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1">
                      {/* Log Scan */}
                      <button
                        onClick={() => openScanModal(s)}
                        className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200"
                        title="Add Tracking Event Scan"
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </button>

                      {/* Upload POD if not delivered */}
                      {s.status !== "delivered" && (
                        <button
                          onClick={() => openPodModal(s)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                          title="Record Proof of Delivery (POD)"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Edit */}
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
                        title="Edit Consignment & Routing"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Shipping Label */}
                      <button
                        onClick={() => setSelectedForLabel(s)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
                        title="Print Barcode Shipping Label"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteShipment(s.awb_number)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                        title="Delete Consignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {shipments.length} of {pagination.totalCount} Consignments
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="font-bold text-slate-800">
              Page {page} of {pagination.totalPages || 1}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* CREATE NEW SHIPMENT MODAL (Full Sender / Pickup & Consignee / Drop Address) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Create Operational Consignment & AWB
                </h3>
                <p className="text-xs text-slate-500">Enter complete pickup and delivery address details.</p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="space-y-4">
              {/* Optional Custom AWB */}
              <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 flex items-center gap-3">
                <span className="text-xs font-bold text-teal-900">Custom AWB (Optional):</span>
                <input
                  type="text"
                  value={formAwb}
                  onChange={(e) => setFormAwb(e.target.value)}
                  placeholder="Auto-generate if blank"
                  className="px-3 py-1 text-xs font-mono rounded border border-teal-300 bg-white"
                />
              </div>

              {/* Pickup / Sender */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>Sender & Pickup Full Address</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Sender Contact Name *"
                    className="px-2.5 py-1.5 text-xs rounded border border-slate-200"
                  />
                  <input
                    type="text"
                    required
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="Sender Phone *"
                    className="px-2.5 py-1.5 text-xs rounded border border-slate-200"
                  />
                  <input
                    type="text"
                    value={senderCompany}
                    onChange={(e) => setSenderCompany(e.target.value)}
                    placeholder="Sender Company"
                    className="px-2.5 py-1.5 text-xs rounded border border-slate-200"
                  />
                </div>
                <input
                  type="text"
                  required
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                  placeholder="Street / Facility Address *"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={senderCity}
                    onChange={(e) => setSenderCity(e.target.value)}
                    placeholder="City *"
                    className="px-2.5 py-1.5 text-xs rounded border border-slate-200"
                  />
                  <input
                    type="text"
                    value={senderState}
                    onChange={(e) => setSenderState(e.target.value)}
                    placeholder="State"
                    className="px-2.5 py-1.5 text-xs rounded border border-slate-200"
                  />
                  <input
                    type="text"
                    required
                    value={senderPincode}
                    onChange={(e) => setSenderPincode(e.target.value)}
                    placeholder="Pincode *"
                    className="px-2.5 py-1.5 font-mono text-xs font-bold rounded border border-slate-200"
                  />
                </div>
              </div>

              {/* Recipient / Drop */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-700" />
                  <span>Recipient & Delivery Full Address</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Recipient Person Name *"
                    className="px-2.5 py-1.5 text-xs rounded border border-slate-200"
                  />
                  <input
                    type="text"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="Recipient Phone *"
                    className="px-2.5 py-1.5 text-xs rounded border border-slate-200"
                  />
                  <input
                    type="text"
                    value={recipientCompany}
                    onChange={(e) => setRecipientCompany(e.target.value)}
                    placeholder="Recipient Company / Facility"
                    className="px-2.5 py-1.5 text-xs rounded border border-slate-200"
                  />
                </div>
                <input
                  type="text"
                  required
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Delivery Street Address *"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={recipientCity}
                    onChange={(e) => setRecipientCity(e.target.value)}
                    placeholder="City *"
                    className="px-2.5 py-1.5 text-xs rounded border border-slate-200"
                  />
                  <input
                    type="text"
                    value={recipientState}
                    onChange={(e) => setRecipientState(e.target.value)}
                    placeholder="State"
                    className="px-2.5 py-1.5 text-xs rounded border border-slate-200"
                  />
                  <input
                    type="text"
                    required
                    value={recipientPincode}
                    onChange={(e) => setRecipientPincode(e.target.value)}
                    placeholder="Pincode *"
                    className="px-2.5 py-1.5 font-mono text-xs font-bold rounded border border-slate-200"
                  />
                </div>
              </div>

              {/* Service & Routing Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Service Tier</label>
                  <select
                    value={serviceCode}
                    onChange={(e) => setServiceCode(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 bg-white"
                  >
                    <option value="cargo">Express Cargo</option>
                    <option value="standard">Surface Standard</option>
                    <option value="cold">Cold Chain (2°-8°C)</option>
                    <option value="intl">International</option>
                    <option value="hyper">Hyperlocal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Weight (KG)</label>
                  <input
                    type="number"
                    min="0.5"
                    value={actualWeight}
                    onChange={(e) => setActualWeight(parseFloat(e.target.value) || 1)}
                    className="w-full px-2 py-1.5 text-xs font-mono font-bold rounded border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Dock Gate</label>
                  <input
                    type="text"
                    value={dockGate}
                    onChange={(e) => setDockGate(e.target.value)}
                    placeholder="Gate D3"
                    className="w-full px-2 py-1.5 text-xs rounded border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 bg-white"
                  >
                    <option value="prepaid">Prepaid</option>
                    <option value="cod">Cash On Delivery</option>
                    <option value="to_pay">To-Pay</option>
                  </select>
                </div>
              </div>

              {/* Vehicle & Driver */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Assign Driver (Optional)</label>
                  <input
                    type="text"
                    value={assignedDriver}
                    onChange={(e) => setAssignedDriver(e.target.value)}
                    placeholder="e.g. Ramesh Gurung"
                    className="w-full px-2 py-1.5 text-xs rounded border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Assign Vehicle (Optional)</label>
                  <input
                    type="text"
                    value={assignedVehicle}
                    onChange={(e) => setAssignedVehicle(e.target.value)}
                    placeholder="Eicher Pro 24ft (KA-03-HA-8812)"
                    className="w-full px-2 py-1.5 text-xs rounded border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs rounded-lg bg-teal-700 text-white font-bold hover:bg-teal-800"
                >
                  Create & Generate Manifest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SHIPMENT MODAL */}
      {isEditOpen && activeShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Edit Consignment {activeShipment.awb_number}
                </h3>
                <p className="text-xs text-slate-500">Update addresses, delivery staff assignment, and lifecycle status.</p>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleUpdateShipment} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-slate-50 font-bold"
                  >
                    <option value="booked">Booked</option>
                    <option value="pickup_scheduled">Pickup Scheduled</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="in_transit">In Transit</option>
                    <option value="destination_hub">At Destination Hub</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed">Delivery Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Dock Gate</label>
                  <input
                    type="text"
                    value={dockGate}
                    onChange={(e) => setDockGate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Assigned Driver</label>
                  <input
                    type="text"
                    value={assignedDriver}
                    onChange={(e) => setAssignedDriver(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Assigned Vehicle</label>
                  <input
                    type="text"
                    value={assignedVehicle}
                    onChange={(e) => setAssignedVehicle(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                <span className="font-bold text-slate-800 block">Recipient Address Edit:</span>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Recipient Name"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                />
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Recipient Street Address"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={recipientCity}
                    onChange={(e) => setRecipientCity(e.target.value)}
                    placeholder="Recipient City"
                    className="px-2.5 py-1.5 rounded border border-slate-200"
                  />
                  <input
                    type="text"
                    value={recipientPincode}
                    onChange={(e) => setRecipientPincode(e.target.value)}
                    placeholder="Recipient Pincode"
                    className="px-2.5 py-1.5 rounded border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-teal-700 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRACKING SCAN LOGGER MODAL */}
      {isScanOpen && activeShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Log Facility Tracking Scan ({activeShipment.awb_number})
                </h3>
                <p className="text-xs text-slate-500">Record certified warehouse barcode milestone & container seal.</p>
              </div>
              <button onClick={() => setIsScanOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveScan} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Milestone Status</label>
                <select
                  value={scanStatus}
                  onChange={(e) => setScanStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-bold bg-slate-50"
                >
                  <option value="picked_up">Picked Up at Origin</option>
                  <option value="origin_hub">Arrived at Origin Sorting Hub</option>
                  <option value="in_transit">In-Transit on Linehaul Corridor</option>
                  <option value="destination_hub">Inbound Arrival at Destination Hub</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered Successfully</option>
                  <option value="failed">Delivery Failed / Exception</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Milestone Title *</label>
                <input
                  type="text"
                  required
                  value={scanTitle}
                  onChange={(e) => setScanTitle(e.target.value)}
                  placeholder="e.g. Cross-Dock Automated Sorting Completed"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Scan Description & Hub Remarks *</label>
                <textarea
                  rows={2}
                  required
                  value={scanDesc}
                  onChange={(e) => setScanDesc(e.target.value)}
                  placeholder="Container Seal #SL-9941 validated intact."
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Facility Name</label>
                  <input
                    type="text"
                    value={scanFacility}
                    onChange={(e) => setScanFacility(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Location City</label>
                  <input
                    type="text"
                    value={scanCity}
                    onChange={(e) => setScanCity(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Gate / Bay</label>
                  <input
                    type="text"
                    value={scanDockGate}
                    onChange={(e) => setScanDockGate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Seal Number</label>
                  <input
                    type="text"
                    value={scanSeal}
                    onChange={(e) => setScanSeal(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Gate Wt (kg)</label>
                  <input
                    type="number"
                    value={scanWeight}
                    onChange={(e) => setScanWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 rounded border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScanOpen(false)}
                  className="px-4 py-2 rounded border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-teal-700 text-white font-bold"
                >
                  Register Tracking Scan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROOF OF DELIVERY (POD) MODAL */}
      {isPodOpen && activeShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Upload Proof of Delivery (POD)
                </h3>
                <p className="text-slate-500">AWB: {activeShipment.awb_number}</p>
              </div>
              <button onClick={() => setIsPodOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSavePod} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Recipient Person Name *</label>
                <input
                  type="text"
                  required
                  value={podRecipientName}
                  onChange={(e) => setPodRecipientName(e.target.value)}
                  placeholder="e.g. Harish Mehta (Store Incharge)"
                  className="w-full px-3 py-2 rounded border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Delivery Remarks</label>
                <textarea
                  rows={2}
                  value={podRemarks}
                  onChange={(e) => setPodRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-200"
                />
              </div>

              {activeShipment.payment_mode === "cod" && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900">
                    <input
                      type="checkbox"
                      checked={podCodCollected}
                      onChange={(e) => setPodCodCollected(e.target.checked)}
                      className="rounded text-teal-700"
                    />
                    <span>COD Amount Collected (₹{activeShipment.cod_amount})</span>
                  </label>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <p className="font-semibold text-slate-700">Digital Handover Signature</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Capturing electronic stylus signature at receiving dock...</p>
                <div className="mt-2 h-14 bg-white rounded border border-dashed border-slate-300 flex items-center justify-center font-mono text-[11px] text-teal-800">
                  ✓ Verified Digital Signatory Handover
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPodOpen(false)}
                  className="px-4 py-2 rounded border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Mark as Delivered & Save POD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT SHIPPING LABEL MODAL */}
      {selectedForLabel && (
        <ShippingLabelModal
          awb={selectedForLabel.awb_number}
          shipment={selectedForLabel}
          onClose={() => setSelectedForLabel(null)}
        />
      )}
    </div>
  );
}
