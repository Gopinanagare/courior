"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  Package,
  Layers,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  Phone,
  ArrowRight,
  Shield,
  QrCode,
  Download,
  Building,
  User,
  Sparkles,
} from "lucide-react";
import ShippingLabelModal from "./ShippingLabelModal";

export default function DualDashboard() {
  const [activeTab, setActiveTab] = useState<"ship" | "track">("ship");

  // Booking Form State - Full Pickup and Drop Address
  const [senderName, setSenderName] = useState("Naveen Ramamurthy");
  const [senderPhone, setSenderPhone] = useState("+91 98450 11982");
  const [senderEmail, setSenderEmail] = useState("dispatch@medtech.com");
  const [senderCompany, setSenderCompany] = useState("MedTech Devices Bangalore");
  const [senderAddress, setSenderAddress] = useState("Unit 4B, Whitefield Logistics Corridor, EPIP Zone");
  const [senderLandmark, setSenderLandmark] = useState("Near ITPL Gate 3");
  const [senderCity, setSenderCity] = useState("Bangalore");
  const [senderState, setSenderState] = useState("Karnataka");
  const [senderPincode, setSenderPincode] = useState("560066");
  const [senderGstin, setSenderGstin] = useState("29AABCE8942N1ZG");

  const [recipientName, setRecipientName] = useState("Vanguard Pharma Corp - Receiving Bay 7");
  const [recipientPhone, setRecipientPhone] = useState("+91 98200 44810");
  const [recipientEmail, setRecipientEmail] = useState("receiving@vanguardpharma.com");
  const [recipientCompany, setRecipientCompany] = useState("Vanguard Pharma India");
  const [recipientAddress, setRecipientAddress] = useState("Plot 14B, MIDC Industrial Estate, Kurla Road");
  const [recipientLandmark, setRecipientLandmark] = useState("Opposite Federal Bank");
  const [recipientCity, setRecipientCity] = useState("Mumbai");
  const [recipientState, setRecipientState] = useState("Maharashtra");
  const [recipientPincode, setRecipientPincode] = useState("400072");

  // Parcel & Service State
  const [packageType, setPackageType] = useState("pallet");
  const [cargoCategory, setCargoCategory] = useState("Precision Healthcare Devices");
  const [actualWeight, setActualWeight] = useState(385);
  const [dimensions, setDimensions] = useState("120x80x140");
  const [piecesCount, setPiecesCount] = useState(1);
  const [serviceTier, setServiceTier] = useState("cargo"); // 'standard', 'cargo', 'cold'
  const [paymentMode, setPaymentMode] = useState<"prepaid" | "cod" | "to_pay">("prepaid");
  const [codAmount, setCodAmount] = useState(0);
  const [declaredValue, setDeclaredValue] = useState(150000);
  const [pickupDate, setPickupDate] = useState("2024-10-24");
  const [pickupSlot, setPickupSlot] = useState("14:00 - 16:30 IST");
  const [dockGate, setDockGate] = useState("Gate D3");

  // Rate Breakdown State
  const [rateBreakdown, setRateBreakdown] = useState({
    baseFreight: 5400.0,
    weightSurcharge: 962.5,
    fuelSurcharge: 267.2,
    insuranceFee: 260.3,
    taxGst: 1239.5,
    totalAmount: 8129.5,
    chargeableWeight: 385.0,
  });

  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookedAwbResult, setBookedAwbResult] = useState<any>(null);
  const [showShippingLabel, setShowShippingLabel] = useState(false);

  // Tracking State
  const [trackingInput, setTrackingInput] = useState("EXL-9024881-IN");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Initial load tracking for default AWB
  useEffect(() => {
    fetchTracking("EXL-9024881-IN");
  }, []);

  // Recalculate rates whenever inputs change
  useEffect(() => {
    calculateLiveRate();
  }, [actualWeight, dimensions, serviceTier, declaredValue, senderPincode, recipientPincode, paymentMode, codAmount]);

  const calculateLiveRate = async () => {
    try {
      const dimParts = dimensions.split("x").map((d) => parseFloat(d.trim()) || 10);
      const [l = 20, w = 20, h = 20] = dimParts;

      const res = await fetch("/api/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceCode: serviceTier,
          actualWeightKg: actualWeight,
          lengthCm: l,
          widthCm: w,
          heightCm: h,
          declaredValue,
          originPincode: senderPincode,
          destinationPincode: recipientPincode,
          paymentMode,
          codAmount,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setRateBreakdown({
          baseFreight: data.data.baseFreight,
          weightSurcharge: data.data.weightSurcharge,
          fuelSurcharge: data.data.fuelSurcharge,
          insuranceFee: data.data.insuranceFee,
          taxGst: data.data.taxGst,
          totalAmount: data.data.totalAmount,
          chargeableWeight: data.data.chargeableWeightKg,
        });
      }
    } catch {
      // Fallback calculation
      let baseMultiplier = serviceTier === "cargo" ? 18 : serviceTier === "cold" ? 30 : 14;
      const base = 2800 + actualWeight * baseMultiplier * 0.4;
      const wt = actualWeight * 2.5;
      const fsc = (base + wt) * 0.042;
      const ins = 260.3;
      const gst = (base + wt + fsc + ins) * 0.18;
      const total = base + wt + fsc + ins + gst;
      setRateBreakdown({
        baseFreight: Number(base.toFixed(2)),
        weightSurcharge: Number(wt.toFixed(2)),
        fuelSurcharge: Number(fsc.toFixed(2)),
        insuranceFee: Number(ins.toFixed(2)),
        taxGst: Number(gst.toFixed(2)),
        totalAmount: Number(total.toFixed(2)),
        chargeableWeight: actualWeight,
      });
    }
  };

  const handleCreateShipment = async () => {
    setIsBookingLoading(true);
    try {
      const dimParts = dimensions.split("x").map((d) => parseFloat(d.trim()) || 10);
      const [l = 20, w = 20, h = 20] = dimParts;

      const payload = {
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

        service_code: serviceTier,
        package_type: packageType,
        cargo_category: cargoCategory,
        pieces_count: piecesCount,
        actual_weight_kg: actualWeight,
        length_cm: l,
        width_cm: w,
        height_cm: h,
        declared_value: declaredValue,
        payment_mode: paymentMode,
        cod_amount: codAmount,
        pickup_date: pickupDate,
        pickup_slot: pickupSlot,
        dock_gate: dockGate,
      };

      const res = await fetch("/api/customer/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create shipment booking.");
      }

      setBookedAwbResult(data.data);
      setTrackingInput(data.data.awb);
      fetchTracking(data.data.awb);
    } catch (err: any) {
      alert("Booking Error: " + err.message);
    } finally {
      setIsBookingLoading(false);
    }
  };

  const fetchTracking = async (awbCode: string) => {
    setIsTrackingLoading(true);
    setTrackingError(null);
    try {
      const res = await fetch(`/api/tracking/${encodeURIComponent(awbCode.trim().toUpperCase())}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Consignment not found.");
      }
      setTrackingData(data.data);
    } catch (err: any) {
      setTrackingError(err.message || "Unable to retrieve tracking history.");
      setTrackingData(null);
    } finally {
      setIsTrackingLoading(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      fetchTracking(trackingInput.trim());
    }
  };

  const loadPresetTemplate = (type: "pharma" | "auto" | "server") => {
    if (type === "pharma") {
      setSenderName("Naveen Ramamurthy");
      setSenderCompany("MedTech Devices Bangalore");
      setSenderAddress("Unit 4B, Whitefield Logistics Corridor, EPIP Zone");
      setSenderCity("Bangalore");
      setSenderPincode("560066");
      setRecipientName("Vanguard Pharma Corp - Receiving Bay 7");
      setRecipientCompany("Vanguard Pharma India");
      setRecipientAddress("Plot 14B, MIDC Industrial Estate, Kurla Road");
      setRecipientCity("Mumbai");
      setRecipientPincode("400072");
      setPackageType("pallet");
      setCargoCategory("Precision Healthcare Devices");
      setActualWeight(385);
      setDimensions("120x80x140");
      setServiceTier("cargo");
      setDockGate("Gate D3");
    } else if (type === "auto") {
      setSenderName("Sunil Shetty");
      setSenderCompany("Apex Auto Parts Ltd");
      setSenderAddress("Peenya Industrial Area, 4th Phase");
      setSenderCity("Bangalore");
      setSenderPincode("560058");
      setRecipientName("Mahesh Joshi");
      setRecipientCompany("Tata Motors Ancillary Unit 3");
      setRecipientAddress("MIDC Bhosari Industrial Area");
      setRecipientCity("Pune");
      setRecipientPincode("411026");
      setPackageType("carton");
      setCargoCategory("Automotive Spare Components");
      setActualWeight(75);
      setDimensions("60x40x40");
      setServiceTier("standard");
      setDockGate("Gate B1");
    } else {
      setSenderName("Naveen Ramamurthy");
      setSenderCompany("MedTech Devices Bangalore");
      setSenderAddress("Unit 4B, Whitefield Logistics Corridor");
      setSenderCity("Bangalore");
      setSenderPincode("560066");
      setRecipientName("Rohan Mehra");
      setRecipientCompany("Delhi Data Center Spares Inc");
      setRecipientAddress("Cyber City, DLF Phase 2, Building 8C");
      setRecipientCity("Gurugram");
      setRecipientPincode("122002");
      setPackageType("carton");
      setCargoCategory("Electronics & Server Spares");
      setActualWeight(120);
      setDimensions("80x60x50");
      setServiceTier("cargo");
      setDockGate("Gate 2");
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Subtle Ambient Glow */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-64 bg-secondary-fixed/30 rounded-full blur-[110px] pointer-events-none"></div>
      </div>

      {/* Operational Mode Selector (Segmented Anchor) */}
      <section className="w-full pt-4 pb-6">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container mb-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
              Enterprise Logistics Engine
            </span>
          </div>
          <h1 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface tracking-tight">
            Precision Freight & Hub Logistics
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Select an operational mode to manage outbound consignments or review hub-to-hub cargo velocity across India.
          </p>
        </div>

        {/* Toggle Controls */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-xl bg-surface-container-high shadow-inner gap-1 border border-slate-200/50">
            <button
              onClick={() => setActiveTab("ship")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "ship"
                  ? "shadow-sm bg-surface-container-lowest text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Truck className={`w-4 h-4 ${activeTab === "ship" ? "text-secondary" : ""}`} />
              <span>Ship Products</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-secondary-fixed/40 text-on-secondary-fixed-variant font-mono-data">
                Book & Dispatch
              </span>
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "track"
                  ? "shadow-sm bg-surface-container-lowest text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Layers className={`w-4 h-4 ${activeTab === "track" ? "text-secondary" : ""}`} />
              <span>Track Consignment</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-mono-data">
                Hub Network
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* DASHBOARD A: SHIP PRODUCTS (Book & Dispatch)              */}
      {/* ======================================================== */}
      {activeTab === "ship" && (
        <section className="w-full pb-12 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Dispatch Configurator (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Address Routing Module - FULL PICKUP & DROP ADDRESS */}
              <div className="bg-surface-container-lowest rounded-xl p-5 sm:p-6 shadow-sm border border-slate-200/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-headline font-bold text-base text-on-surface leading-tight">
                        Consignment Route & Complete Addresses
                      </h2>
                      <p className="text-xs text-on-surface-variant">
                        Configure full facility node origins, sender contact, and delivery destinations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="text-[11px] text-slate-400 font-medium">Quick Template:</span>
                    <button
                      onClick={() => loadPresetTemplate("pharma")}
                      className="px-2 py-1 text-[11px] font-medium rounded-md bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      Pharma Bay
                    </button>
                    <button
                      onClick={() => loadPresetTemplate("auto")}
                      className="px-2 py-1 text-[11px] font-medium rounded-md bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      Auto Spares
                    </button>
                    <button
                      onClick={() => loadPresetTemplate("server")}
                      className="px-2 py-1 text-[11px] font-medium rounded-md bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      Server Hub
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Origin / Full Pickup Address Card */}
                  <div className="p-4 rounded-lg bg-surface-container-low border border-slate-200/50 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-secondary uppercase tracking-wider font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        Origin / Full Pickup Address
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono-data bg-white px-2 py-0.5 rounded border">
                        Node: {senderCity}
                      </span>
                    </div>

                    <div className="space-y-2 pt-1">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Sender Contact & Phone *</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            placeholder="Contact Person Name"
                            className="w-full bg-surface-container-lowest rounded-md px-2.5 py-1.5 text-xs text-on-surface border border-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary"
                          />
                          <input
                            type="text"
                            value={senderPhone}
                            onChange={(e) => setSenderPhone(e.target.value)}
                            placeholder="+91 Phone"
                            className="w-full bg-surface-container-lowest rounded-md px-2.5 py-1.5 text-xs text-on-surface border border-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Company Name</label>
                          <input
                            type="text"
                            value={senderCompany}
                            onChange={(e) => setSenderCompany(e.target.value)}
                            placeholder="Company / Facility"
                            className="w-full bg-surface-container-lowest rounded-md px-2.5 py-1.5 text-xs text-on-surface border border-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-0.5">GSTIN / Facility ID</label>
                          <input
                            type="text"
                            value={senderGstin}
                            onChange={(e) => setSenderGstin(e.target.value)}
                            placeholder="29AABCE..."
                            className="w-full bg-surface-container-lowest rounded-md px-2.5 py-1.5 font-mono-data text-xs text-on-surface border border-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Street Address & Landmark *</label>
                        <input
                          type="text"
                          value={senderAddress}
                          onChange={(e) => setSenderAddress(e.target.value)}
                          placeholder="Premises / Plot / Street Address"
                          className="w-full bg-surface-container-lowest rounded-md px-2.5 py-1.5 text-xs text-on-surface border border-slate-200 focus:outline-none mb-1.5"
                        />
                        <input
                          type="text"
                          value={senderLandmark}
                          onChange={(e) => setSenderLandmark(e.target.value)}
                          placeholder="Landmark (Optional)"
                          className="w-full bg-surface-container-lowest rounded-md px-2.5 py-1 text-[11px] text-slate-600 border border-slate-200 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-0.5">City *</label>
                          <input
                            type="text"
                            value={senderCity}
                            onChange={(e) => setSenderCity(e.target.value)}
                            className="w-full bg-surface-container-lowest rounded-md px-2 py-1.5 text-xs text-on-surface border border-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-0.5">State</label>
                          <input
                            type="text"
                            value={senderState}
                            onChange={(e) => setSenderState(e.target.value)}
                            className="w-full bg-surface-container-lowest rounded-md px-2 py-1.5 text-xs text-on-surface border border-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Pincode *</label>
                          <input
                            type="text"
                            value={senderPincode}
                            onChange={(e) => setSenderPincode(e.target.value)}
                            className="w-full bg-surface-container-lowest rounded-md px-2 py-1.5 font-mono-data text-xs text-on-surface border border-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Destination / Full Drop Address Card */}
                  <div className="p-4 rounded-lg bg-surface-container-low border border-slate-200/50 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-on-surface uppercase tracking-wider font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-700" />
                        Destination / Full Drop Address
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono-data bg-white px-2 py-0.5 rounded border">
                        Node: {recipientCity}
                      </span>
                    </div>

                    <div className="space-y-2 pt-1">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Recipient Name & Phone *</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            placeholder="Recipient Incharge"
                            className="w-full bg-surface-container-lowest rounded-md px-2.5 py-1.5 text-xs text-on-surface border border-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary"
                          />
                          <input
                            type="text"
                            value={recipientPhone}
                            onChange={(e) => setRecipientPhone(e.target.value)}
                            placeholder="+91 Consignee Phone"
                            className="w-full bg-surface-container-lowest rounded-md px-2.5 py-1.5 text-xs text-on-surface border border-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Company / Dept</label>
                          <input
                            type="text"
                            value={recipientCompany}
                            onChange={(e) => setRecipientCompany(e.target.value)}
                            placeholder="Consignee Facility"
                            className="w-full bg-surface-container-lowest rounded-md px-2.5 py-1.5 text-xs text-on-surface border border-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Recipient Email</label>
                          <input
                            type="email"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            placeholder="receiving@corp.com"
                            className="w-full bg-surface-container-lowest rounded-md px-2.5 py-1.5 text-xs text-on-surface border border-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Delivery Street Address & Landmark *</label>
                        <input
                          type="text"
                          value={recipientAddress}
                          onChange={(e) => setRecipientAddress(e.target.value)}
                          placeholder="Warehouse / Receiving Bay / Building"
                          className="w-full bg-surface-container-lowest rounded-md px-2.5 py-1.5 text-xs text-on-surface border border-slate-200 focus:outline-none mb-1.5"
                        />
                        <input
                          type="text"
                          value={recipientLandmark}
                          onChange={(e) => setRecipientLandmark(e.target.value)}
                          placeholder="Landmark (Optional)"
                          className="w-full bg-surface-container-lowest rounded-md px-2.5 py-1 text-[11px] text-slate-600 border border-slate-200 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-0.5">City *</label>
                          <input
                            type="text"
                            value={recipientCity}
                            onChange={(e) => setRecipientCity(e.target.value)}
                            className="w-full bg-surface-container-lowest rounded-md px-2 py-1.5 text-xs text-on-surface border border-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-0.5">State</label>
                          <input
                            type="text"
                            value={recipientState}
                            onChange={(e) => setRecipientState(e.target.value)}
                            className="w-full bg-surface-container-lowest rounded-md px-2 py-1.5 text-xs text-on-surface border border-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Pincode *</label>
                          <input
                            type="text"
                            value={recipientPincode}
                            onChange={(e) => setRecipientPincode(e.target.value)}
                            className="w-full bg-surface-container-lowest rounded-md px-2 py-1.5 font-mono-data text-xs text-on-surface border border-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parcel Attributes & Package Matrix */}
              <div className="bg-surface-container-lowest rounded-xl p-5 sm:p-6 shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-headline font-bold text-base text-on-surface leading-tight">
                        Consignment Specs & Freight Unit
                      </h2>
                      <p className="text-xs text-on-surface-variant">
                        Dead-weight, volumetric cubing, and unit classification
                      </p>
                    </div>
                  </div>
                  <span className="font-mono-data text-xs px-2.5 py-1 rounded bg-surface-container text-on-surface-variant font-medium">
                    Standard 1:5000 Density
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <div className="p-3 rounded-lg bg-surface-container-low border border-slate-200/40">
                    <label className="text-[11px] font-medium text-on-surface-variant block mb-1">Packaging Form</label>
                    <select
                      value={packageType}
                      onChange={(e) => setPackageType(e.target.value)}
                      className="w-full bg-surface-container-lowest rounded-md px-2 py-1.5 text-xs text-on-surface focus:outline-none border border-slate-200 font-medium"
                    >
                      <option value="pallet">Euro Wooden Pallet</option>
                      <option value="carton">Corrugated Carton</option>
                      <option value="tote">Sealed Secure Tote</option>
                      <option value="drum">Industrial Metal Drum</option>
                      <option value="flyer">Tamper-Proof Flyer</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low border border-slate-200/40">
                    <label className="text-[11px] font-medium text-on-surface-variant block mb-1">Total Weight (KG)</label>
                    <div className="flex items-center bg-surface-container-lowest rounded-md px-2 py-1.5 border border-slate-200">
                      <input
                        type="number"
                        min="0.5"
                        value={actualWeight}
                        onChange={(e) => setActualWeight(Math.max(0.5, parseFloat(e.target.value) || 1))}
                        className="w-full font-mono-data text-xs font-semibold text-on-surface focus:outline-none"
                      />
                      <span className="text-[11px] text-outline font-medium">kg</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low border border-slate-200/40">
                    <label className="text-[11px] font-medium text-on-surface-variant block mb-1">Dimensions (LxWxH)</label>
                    <div className="flex items-center bg-surface-container-lowest rounded-md px-2 py-1.5 border border-slate-200">
                      <input
                        type="text"
                        value={dimensions}
                        onChange={(e) => setDimensions(e.target.value)}
                        placeholder="120x80x140"
                        className="w-full font-mono-data text-xs font-semibold text-on-surface focus:outline-none"
                      />
                      <span className="text-[11px] text-outline font-medium">cm</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low border border-slate-200/40">
                    <label className="text-[11px] font-medium text-on-surface-variant block mb-1">Cargo Category</label>
                    <select
                      value={cargoCategory}
                      onChange={(e) => setCargoCategory(e.target.value)}
                      className="w-full bg-surface-container-lowest rounded-md px-2 py-1.5 text-xs text-on-surface focus:outline-none border border-slate-200 font-medium"
                    >
                      <option>Precision Healthcare Devices</option>
                      <option>Automotive Spare Components</option>
                      <option>Electronics & Server Spares</option>
                      <option>Specialty Chemicals (Regulated)</option>
                      <option>Industrial Machinery & Tools</option>
                      <option>Apparel & Consumer Goods</option>
                    </select>
                  </div>
                </div>

                {/* Service Tier Selection Cards */}
                <label className="text-xs font-bold text-on-surface block mb-2 uppercase tracking-wider">
                  Select Transit Velocity Tier
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Tier 1: Surface Standard */}
                  <label
                    onClick={() => setServiceTier("standard")}
                    className={`flex flex-col p-4 rounded-xl cursor-pointer transition-all relative border ${
                      serviceTier === "standard"
                        ? "bg-surface-container-high border-secondary ring-2 ring-secondary/20 shadow-xs"
                        : "bg-surface-container-low border-slate-200 hover:bg-surface-container"
                    }`}
                  >
                    <input
                      type="radio"
                      name="service_tier"
                      checked={serviceTier === "standard"}
                      onChange={() => setServiceTier("standard")}
                      className="absolute top-4 right-4 text-secondary accent-secondary"
                    />
                    <div className="flex items-center gap-1.5 text-on-surface mb-1">
                      <span className="material-symbols-outlined text-secondary text-[20px]">directions_boat</span>
                      <span className="font-headline font-semibold text-sm">Surface Standard</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-4">
                      Scheduled inter-city linehaul via consolidated express trailers.
                    </p>
                    <div className="mt-auto flex items-baseline justify-between pt-2 border-t border-slate-200/50">
                      <span className="text-[11px] text-on-surface-variant">Est. 48 - 60 Hrs</span>
                      <span className="font-mono-data text-xs text-on-surface font-semibold">₹3,420</span>
                    </div>
                  </label>

                  {/* Tier 2: Express Cargo (Selected) */}
                  <label
                    onClick={() => setServiceTier("cargo")}
                    className={`flex flex-col p-4 rounded-xl cursor-pointer transition-all relative border ${
                      serviceTier === "cargo"
                        ? "bg-surface-container-high border-secondary ring-2 ring-secondary/20 shadow-xs"
                        : "bg-surface-container-low border-slate-200 hover:bg-surface-container"
                    }`}
                  >
                    <input
                      type="radio"
                      name="service_tier"
                      checked={serviceTier === "cargo"}
                      onChange={() => setServiceTier("cargo")}
                      className="absolute top-4 right-4 text-secondary accent-secondary"
                    />
                    <div className="flex items-center gap-1.5 text-on-surface mb-1">
                      <span className="material-symbols-outlined text-secondary text-[20px]">flight_takeoff</span>
                      <span className="font-headline font-semibold text-sm">Express Cargo</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-4">
                      Priority airport-to-hub express shuttles with expedited staging.
                    </p>
                    <div className="mt-auto flex items-baseline justify-between pt-2 border-t border-slate-200/50">
                      <span className="text-[11px] text-secondary font-medium">Est. 24 - 30 Hrs</span>
                      <span className="font-mono-data text-xs text-secondary font-bold">₹6,890</span>
                    </div>
                  </label>

                  {/* Tier 3: Cold Chain */}
                  <label
                    onClick={() => setServiceTier("cold")}
                    className={`flex flex-col p-4 rounded-xl cursor-pointer transition-all relative border ${
                      serviceTier === "cold"
                        ? "bg-surface-container-high border-secondary ring-2 ring-secondary/20 shadow-xs"
                        : "bg-surface-container-low border-slate-200 hover:bg-surface-container"
                    }`}
                  >
                    <input
                      type="radio"
                      name="service_tier"
                      checked={serviceTier === "cold"}
                      onChange={() => setServiceTier("cold")}
                      className="absolute top-4 right-4 text-secondary accent-secondary"
                    />
                    <div className="flex items-center gap-1.5 text-on-surface mb-1">
                      <span className="material-symbols-outlined text-secondary text-[20px]">ac_unit</span>
                      <span className="font-headline font-semibold text-sm">Cold Chain (2°-8°C)</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-4">
                      Temperature-validated reefer network with continuous hub logging.
                    </p>
                    <div className="mt-auto flex items-baseline justify-between pt-2 border-t border-slate-200/50">
                      <span className="text-[11px] text-on-surface-variant">Est. 28 - 36 Hrs</span>
                      <span className="font-mono-data text-xs text-on-surface font-semibold">₹11,400</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Scheduled Pickup Slot Card */}
              <div className="bg-surface-container-lowest rounded-xl p-5 sm:p-6 shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-headline font-bold text-base text-on-surface leading-tight">
                        Hub Staging & Pickup Window
                      </h2>
                      <p className="text-xs text-on-surface-variant">
                        Coordinate dock availability and ground vehicle allocation
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono-data px-2.5 py-1 rounded bg-secondary-fixed/40 text-on-secondary-fixed-variant font-medium">
                    Bay Reserved: {dockGate}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-surface-container-low border border-slate-200/40">
                    <span className="text-[11px] text-on-surface-variant block mb-1 font-medium">Dispatch Date</span>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full bg-white rounded px-2 py-1 text-xs font-semibold text-on-surface border border-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low border border-slate-200/40">
                    <span className="text-[11px] text-on-surface-variant block mb-1 font-medium">Loading Dock Slot</span>
                    <select
                      value={pickupSlot}
                      onChange={(e) => setPickupSlot(e.target.value)}
                      className="w-full bg-white rounded px-2 py-1 text-xs font-semibold text-on-surface border border-slate-200 focus:outline-none"
                    >
                      <option value="10:00 - 12:30 IST">10:00 - 12:30 IST (Morning Bay)</option>
                      <option value="14:00 - 16:30 IST">14:00 - 16:30 IST (Afternoon Linehaul)</option>
                      <option value="18:00 - 20:30 IST">18:00 - 20:30 IST (Night Express Shuttle)</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low border border-slate-200/40">
                    <span className="text-[11px] text-on-surface-variant block mb-1 font-medium">Assigned Ground Vehicle</span>
                    <div className="flex items-center justify-between text-xs font-medium text-on-surface bg-white rounded px-2 py-1 border border-slate-200">
                      <span>Eicher Pro 24ft (KA-03-HA-8812)</span>
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Cost Summary & Live Rate Calculation Card (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Live Rate Calculator Breakdown Card */}
              <div className="bg-surface-container-lowest rounded-xl p-5 sm:p-6 shadow-sm border border-slate-200/60 sticky top-20">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-headline font-bold text-base text-on-surface">Rate Computation</h3>
                  <span className="font-mono-data text-[11px] text-on-secondary-container bg-secondary-fixed/50 px-2 py-0.5 rounded font-semibold">
                    Tariff v4.1 Verified
                  </span>
                </div>

                <div className="space-y-2.5 py-4 text-xs text-on-surface-variant">
                  <div className="flex justify-between">
                    <span>Base Freight ({senderCity} → {recipientCity})</span>
                    <span className="font-mono-data text-on-surface font-semibold">
                      ₹{rateBreakdown.baseFreight.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weight Surcharge ({actualWeight} kg @ standard slab)</span>
                    <span className="font-mono-data text-on-surface font-semibold">
                      ₹{rateBreakdown.weightSurcharge.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fuel Index Adjustment (FSC 4.2%)</span>
                    <span className="font-mono-data text-on-surface font-semibold">
                      ₹{rateBreakdown.fuelSurcharge.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cargo Transit Insurance (Declared Val.)</span>
                    <span className="font-mono-data text-on-surface font-semibold">
                      ₹{rateBreakdown.insuranceFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Goods & Services Tax (GST 18%)</span>
                    <span className="font-mono-data text-on-surface font-semibold">
                      ₹{rateBreakdown.taxGst.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-slate-200 items-baseline">
                    <span className="text-xs font-bold text-on-surface uppercase tracking-wide">
                      Total Quotation (Incl. GST)
                    </span>
                    <span className="font-headline font-bold text-xl text-secondary">
                      ₹{rateBreakdown.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleCreateShipment}
                    disabled={isBookingLoading}
                    className="w-full py-3 px-4 rounded-lg bg-secondary text-white font-headline font-bold text-sm hover:bg-secondary-hover transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {isBookingLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4" />
                        <span>Generate AWB & Request Pickup</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    Instantly issues a compliant electronic e-Way bill & manifest barcode.
                  </p>
                </div>

                {/* Facility Quick Context / Visual Reference */}
                <div className="mt-6 rounded-lg overflow-hidden border border-slate-200">
                  <div className="h-32 relative bg-slate-900">
                    <img
                      className="w-full h-full object-cover opacity-80"
                      alt="Modern sorting hub"
                      src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                    <div className="absolute bottom-2.5 left-3">
                      <span className="text-[10px] uppercase tracking-wider text-teal-300 font-bold bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-sm">
                        Origin Facility Verified
                      </span>
                      <p className="font-headline font-bold text-white text-xs mt-0.5">
                        Whitefield High-Capacity Hub (BLR-WFD)
                      </p>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-1.5 rounded bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Dock Gates</span>
                      <span className="font-mono-data font-bold text-slate-800">18 Active</span>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Avg Dwell Time</span>
                      <span className="font-mono-data font-bold text-slate-800">22 Minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* DASHBOARD B: TRACK CONSIGNMENT (Hub & City-Level Ledger) */}
      {/* ======================================================== */}
      {activeTab === "track" && (
        <section className="w-full pb-12 animate-fadeIn">
          {/* Tracking Lookup Filter Bar */}
          <div className="w-full bg-surface-container-lowest rounded-xl p-5 sm:p-6 shadow-sm border border-slate-200/60 mb-6">
            <div className="max-w-3xl mx-auto text-center mb-5">
              <h2 className="font-headline font-bold text-xl sm:text-2xl text-on-surface">
                City & Hub Facility Ledger
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                Direct visibility into regional sort centers and linehaul transfers. Zero micro GPS noise—only verified facility ingress and dispatch milestones.
              </p>
            </div>

            <form onSubmit={handleTrackSubmit} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Enter Consignment AWB / Container ID..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-container-low font-mono-data text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-white border border-slate-200 shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={isTrackingLoading}
                className="px-6 py-2.5 rounded-lg bg-secondary text-white font-headline font-bold text-xs sm:text-sm hover:bg-secondary-hover transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                {isTrackingLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Query Hub Status</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Pick Tags */}
            <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px] text-outline">
              <span>Recent Queries:</span>
              <button
                onClick={() => {
                  setTrackingInput("EXL-9024881-IN");
                  fetchTracking("EXL-9024881-IN");
                }}
                className="font-mono-data text-on-surface-variant hover:text-secondary underline decoration-dotted"
              >
                EXL-9024881-IN (Active Transit)
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setTrackingInput("EXL-6612044-IN");
                  fetchTracking("EXL-6612044-IN");
                }}
                className="font-mono-data text-on-surface-variant hover:text-secondary underline decoration-dotted"
              >
                EXL-6612044-IN (Delivered at Hub)
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setTrackingInput("EXL-89420-EXP");
                  fetchTracking("EXL-89420-EXP");
                }}
                className="font-mono-data text-on-surface-variant hover:text-secondary underline decoration-dotted"
              >
                EXL-89420-EXP (Staged at Gate 2)
              </button>
            </div>
          </div>

          {trackingError && (
            <div className="p-4 mb-6 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{trackingError}</span>
            </div>
          )}

          {trackingData && (
            <>
              {/* Active Consignment Status Header */}
              <div className="bg-surface-container-lowest rounded-xl p-5 sm:p-6 shadow-sm border border-slate-200/60 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono-data text-xl sm:text-2xl font-bold text-on-surface">
                        {trackingData.awb}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-xs font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                        {trackingData.status === "delivered"
                          ? "Delivered Successfully"
                          : `In-Transit: ${trackingData.currentHub?.name || "Corridor Linehaul"}`}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Consignor: <span className="font-semibold text-on-surface">{trackingData.senderName} ({trackingData.senderCompany || trackingData.senderCity})</span> • Service: <span className="font-semibold text-on-surface">{trackingData.serviceName}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-lg bg-surface-container-low border border-slate-200/60 text-right">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                        {trackingData.status === "delivered" ? "Delivered At" : "Next Scheduled Inbound"}
                      </span>
                      <span className="font-headline font-bold text-xs sm:text-sm text-on-surface">
                        {trackingData.status === "delivered"
                          ? `${trackingData.recipientCity} (${trackingData.podDeliveredAt || "Completed"})`
                          : `${trackingData.destHub?.name || trackingData.recipientCity} (Tomorrow 08:30 IST)`}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowShippingLabel(true)}
                      className="p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors border border-slate-200"
                      title="Download Official Hub Manifest & Shipping Label"
                    >
                      <Download className="w-5 h-5 text-secondary" />
                    </button>
                  </div>
                </div>

                {/* Macro Hub-to-Hub Progress Route (Minimalist Pipeline) */}
                <div className="pt-6 pb-2">
                  <div className="relative flex items-center justify-between max-w-4xl mx-auto px-4">
                    {/* Background track line */}
                    <div className="absolute left-10 right-10 h-1 bg-surface-container top-1/2 -translate-y-1/2"></div>
                    
                    {/* Active Progress Bar Line */}
                    <div
                      className="absolute left-10 h-1 bg-secondary top-1/2 -translate-y-1/2 transition-all duration-500"
                      style={{
                        width:
                          trackingData.status === "delivered"
                            ? "calc(100% - 80px)"
                            : trackingData.status === "out_for_delivery"
                            ? "75%"
                            : trackingData.status === "in_transit"
                            ? "50%"
                            : "25%",
                      }}
                    ></div>

                    {/* Step 1: Origin */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-on-surface mt-1.5">
                        {trackingData.originHub?.city || trackingData.senderCity} (Origin)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {trackingData.originHub?.name || "Staging Center"}
                      </span>
                    </div>

                    {/* Step 2: Linehaul Transit */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                          ["in_transit", "destination_hub", "out_for_delivery", "delivered"].includes(trackingData.status)
                            ? "bg-surface-container-lowest ring-4 ring-secondary text-secondary font-bold"
                            : "bg-surface-container text-slate-400"
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-secondary mt-1.5">
                        Linehaul Corridor
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Pune / Transit Hub
                      </span>
                    </div>

                    {/* Step 3: Destination Staging */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          ["destination_hub", "out_for_delivery", "delivered"].includes(trackingData.status)
                            ? "bg-secondary text-white"
                            : "bg-surface-container text-slate-400"
                        }`}
                      >
                        <Building className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-slate-700 mt-1.5">
                        Dest Hub
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Inbound Terminal
                      </span>
                    </div>

                    {/* Step 4: Final Delivery */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          trackingData.status === "delivered"
                            ? "bg-secondary text-white ring-4 ring-secondary/20"
                            : "bg-surface-container text-slate-400"
                        }`}
                      >
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-slate-700 mt-1.5">
                        {trackingData.recipientCity} (Final)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Consignee Bay
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two Column Hub Telemetry & History */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Facility Ledger & Event Milestones (8 Cols) */}
                <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-5 sm:p-6 shadow-sm border border-slate-200/60">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-headline font-bold text-base text-on-surface leading-tight">
                          Verified Hub Custody Ledger
                        </h3>
                        <p className="text-xs text-on-surface-variant">
                          Chronological audit of warehouse scanning events, container seals, and gate weights
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono-data px-2.5 py-1 rounded bg-surface-container text-on-surface-variant">
                      {trackingData.events?.length || 0} Facility Records
                    </span>
                  </div>

                  {/* Chronological Timeline */}
                  <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container">
                    {trackingData.events?.map((ev: any, idx: number) => (
                      <div key={idx} className="relative flex items-start gap-3">
                        <span
                          className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full ring-4 ring-white ${
                            idx === 0 ? "bg-secondary" : "bg-slate-400"
                          }`}
                        ></span>
                        <div className="flex-1 bg-surface-container-low rounded-lg p-3.5 border border-slate-200/40">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-xs font-bold text-on-surface">
                              {ev.title}
                            </span>
                            <span className="font-mono-data text-[11px] text-secondary font-medium">
                              {ev.event_time}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                            {ev.description}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {ev.dock_gate && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-600 font-mono-data border">
                                Bay: {ev.dock_gate}
                              </span>
                            )}
                            {ev.container_seal && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-600 font-mono-data border">
                                Container Seal: {ev.container_seal}
                              </span>
                            )}
                            {ev.weight_at_gate && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-600 font-mono-data border">
                                Gate Wt: {ev.weight_at_gate} kg
                              </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-mono-data border border-teal-200">
                              Node: {ev.facility_code || ev.location_city}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recipient Hub Overview & City Network Visual (4 Cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  {/* Recipient City Hub Dossier */}
                  <div className="bg-surface-container-lowest rounded-xl p-5 sm:p-6 shadow-sm border border-slate-200/60">
                    <h3 className="font-headline font-bold text-base text-on-surface mb-3">
                      Target Inbound Terminal
                    </h3>
                    <div className="rounded-lg overflow-hidden relative mb-3 bg-slate-900">
                      <img
                        className="w-full h-32 object-cover opacity-85"
                        alt="Target Inbound Terminal"
                        src="https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=600&q=80"
                      />
                      <div className="absolute bottom-2 left-2.5 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono-data text-teal-300">
                        Facility Node: {trackingData.destHub?.code || "BOM-CEN-01"}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-on-surface-variant">
                      <div className="flex justify-between">
                        <span>Facility Name:</span>
                        <span className="font-semibold text-on-surface">
                          {trackingData.destHub?.name || "Mumbai Central Dist. Center"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Receiving Address:</span>
                        <span className="text-on-surface text-right truncate max-w-[180px]">
                          {trackingData.recipientAddress || "MIDC Kurla Road"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Consignee Person:</span>
                        <span className="text-on-surface font-medium">
                          {trackingData.recipientName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Receiving Pincode:</span>
                        <span className="font-mono-data text-on-surface font-bold">
                          {trackingData.recipientPincode}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <a
                        href={`tel:${trackingData.recipientPhone || "18008903965"}`}
                        className="w-full py-2 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-secondary" />
                        <span>Contact Consignee Desk</span>
                      </a>
                    </div>
                  </div>

                  {/* Hub Policy Notice */}
                  <div className="bg-surface-container-low rounded-xl p-4 border border-slate-200/50">
                    <div className="flex items-start gap-2.5">
                      <Shield className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-on-surface">Hub-Level Integrity Policy</p>
                        <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                          For commercial security and highway safety, Exolent Express publishes verified facility scans rather than raw micro-GPS pings.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {/* Booking Confirmation / Shipping Label Modal */}
      {bookedAwbResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-headline font-bold text-xl text-center text-slate-900">
              Consignment Booked Successfully!
            </h3>
            <p className="text-xs text-center text-slate-500 mt-1">
              AWB generated & scheduled at {dockGate}. Manifest ready for linehaul dispatch.
            </p>

            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Air Waybill (AWB):</span>
                <span className="font-mono-data text-sm font-bold text-teal-700">
                  {bookedAwbResult.awb}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Number:</span>
                <span className="font-mono-data font-semibold">{bookedAwbResult.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pickup Slot:</span>
                <span className="font-medium text-slate-800">{bookedAwbResult.pickupSlot} ({dockGate})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Pre-paid Freight:</span>
                <span className="font-bold text-slate-900">₹{bookedAwbResult.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowShippingLabel(true);
                }}
                className="py-2.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-4 h-4 text-secondary" />
                <span>View Shipping Label</span>
              </button>
              <button
                onClick={() => {
                  setBookedAwbResult(null);
                  setActiveTab("track");
                }}
                className="py-2.5 px-3 rounded-lg bg-secondary text-white text-xs font-bold hover:bg-secondary-hover transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Track Live Consignment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Shipping Label Modal */}
      {showShippingLabel && (
        <ShippingLabelModal
          awb={trackingData?.awb || bookedAwbResult?.awb || "EXL-9024881-IN"}
          shipment={trackingData || {
            awb: bookedAwbResult?.awb || "EXL-9024881-IN",
            senderName,
            senderCompany,
            senderAddress,
            senderCity,
            senderState,
            senderPincode,
            senderPhone,
            recipientName,
            recipientCompany,
            recipientAddress,
            recipientCity,
            recipientState,
            recipientPincode,
            recipientPhone,
            serviceName: serviceTier === "cargo" ? "Express Cargo" : serviceTier === "cold" ? "Cold Chain (2°-8°C)" : "Surface Standard",
            packageType,
            chargeableWeightKg: actualWeight,
            piecesCount,
            dockGate,
            pickupDate,
            pickupSlot,
          }}
          onClose={() => setShowShippingLabel(false)}
        />
      )}
    </div>
  );
}
