"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShippingLabelModal from "@/components/ShippingLabelModal";
import {
  Truck,
  MapPin,
  Package,
  Calendar,
  CheckCircle2,
  QrCode,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building,
  User,
  Phone,
  Mail,
  FileText,
} from "lucide-react";

export default function BookShipmentPage() {
  // Sender / Pickup Details
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

  // Recipient / Drop Details
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientCompany, setRecipientCompany] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientLandmark, setRecipientLandmark] = useState("");
  const [recipientCity, setRecipientCity] = useState("Mumbai");
  const [recipientState, setRecipientState] = useState("Maharashtra");
  const [recipientPincode, setRecipientPincode] = useState("400072");

  // Parcel & Specs
  const [serviceCode, setServiceCode] = useState("cargo");
  const [packageType, setPackageType] = useState("carton");
  const [cargoCategory, setCargoCategory] = useState("General Cargo");
  const [actualWeight, setActualWeight] = useState(15);
  const [lengthCm, setLengthCm] = useState(30);
  const [widthCm, setWidthCm] = useState(30);
  const [heightCm, setHeightCm] = useState(30);
  const [piecesCount, setPiecesCount] = useState(1);
  const [declaredValue, setDeclaredValue] = useState(10000);
  const [paymentMode, setPaymentMode] = useState<"prepaid" | "cod" | "to_pay">("prepaid");
  const [codAmount, setCodAmount] = useState(0);
  const [pickupDate, setPickupDate] = useState("");
  const [pickupSlot, setPickupSlot] = useState("14:00 - 16:30 IST");
  const [dockGate, setDockGate] = useState("Gate 1");
  const [saveSenderAddress, setSaveSenderAddress] = useState(false);
  const [saveRecipientAddress, setSaveRecipientAddress] = useState(false);

  // Rate Breakdown
  const [rate, setRate] = useState<any>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [showLabelModal, setShowLabelModal] = useState(false);

  // Set default date
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setPickupDate(today);
  }, []);

  // Fetch live rate calculation
  useEffect(() => {
    calculateRate();
  }, [actualWeight, lengthCm, widthCm, heightCm, serviceCode, declaredValue, senderPincode, recipientPincode, paymentMode, codAmount]);

  const calculateRate = async () => {
    setLoadingRate(true);
    try {
      const res = await fetch("/api/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceCode,
          actualWeightKg: actualWeight,
          lengthCm,
          widthCm,
          heightCm,
          declaredValue,
          originPincode: senderPincode,
          destinationPincode: recipientPincode,
          paymentMode,
          codAmount,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setRate(data.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoadingRate(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderPhone || !senderAddress || !senderCity || !senderPincode) {
      alert("Please fill in the complete Sender / Pickup address.");
      return;
    }
    if (!recipientName || !recipientPhone || !recipientAddress || !recipientCity || !recipientPincode) {
      alert("Please fill in the complete Recipient / Delivery address.");
      return;
    }

    setBookingLoading(true);
    try {
      const res = await fetch("/api/customer/bookings", {
        method: "POST",
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
          pieces_count: piecesCount,
          actual_weight_kg: actualWeight,
          length_cm: lengthCm,
          width_cm: widthCm,
          height_cm: heightCm,
          declared_value: declaredValue,
          payment_mode: paymentMode,
          cod_amount: codAmount,
          pickup_date: pickupDate,
          pickup_slot: pickupSlot,
          dock_gate: dockGate,
          save_sender_address: saveSenderAddress,
          save_recipient_address: saveRecipientAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to book shipment.");
      }

      setBookingSuccess(data.data);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      <main className="w-full pt-20 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-6">
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
            Consignment Dispatcher
          </span>
          <h1 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface mt-1">
            Book New Courier Pickup
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Enter complete origin pickup details and consignee drop location with live rate tariff calculation.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: Pickup, Drop, Specs */}
            <div className="lg:col-span-8 space-y-6">
              {/* Pickup / Sender Full Details Card */}
              <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-secondary flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h2 className="font-headline font-bold text-base text-slate-900">
                    Sender & Pickup Address (Full Details)
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Person Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="+91 98450 11982"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="dispatch@company.com"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company / Organization Name
                    </label>
                    <input
                      type="text"
                      value={senderCompany}
                      onChange={(e) => setSenderCompany(e.target.value)}
                      placeholder="e.g. MedTech Devices Bangalore"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Complete Street / Building Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={senderAddress}
                      onChange={(e) => setSenderAddress(e.target.value)}
                      placeholder="Unit 4B, Whitefield Logistics Corridor, EPIP Zone"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={senderLandmark}
                      onChange={(e) => setSenderLandmark(e.target.value)}
                      placeholder="Near ITPL Gate 3"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      value={senderGstin}
                      onChange={(e) => setSenderGstin(e.target.value)}
                      placeholder="29AABCE8942N1ZG"
                      className="w-full px-3 py-2 font-mono text-xs rounded-lg border border-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={senderCity}
                      onChange={(e) => setSenderCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        value={senderState}
                        onChange={(e) => setSenderState(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode *</label>
                      <input
                        type="text"
                        required
                        value={senderPincode}
                        onChange={(e) => setSenderPincode(e.target.value)}
                        className="w-full px-3 py-2 font-mono font-bold text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Drop / Recipient Full Details Card */}
              <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-secondary flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h2 className="font-headline font-bold text-base text-slate-900">
                    Recipient & Drop Address (Full Details)
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Recipient Person Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Harish Mehta"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Recipient Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="+91 98200 44810"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Recipient Email (For delivery alerts)
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="receiving@vanguardpharma.com"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Recipient Company / Facility Name
                    </label>
                    <input
                      type="text"
                      value={recipientCompany}
                      onChange={(e) => setRecipientCompany(e.target.value)}
                      placeholder="e.g. Vanguard Pharma Corp - Receiving Bay 7"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Complete Delivery Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="Plot 14B, MIDC Industrial Estate, Kurla Road"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={recipientLandmark}
                      onChange={(e) => setRecipientLandmark(e.target.value)}
                      placeholder="Opposite Federal Bank"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:col-span-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={recipientCity}
                        onChange={(e) => setRecipientCity(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        value={recipientState}
                        onChange={(e) => setRecipientState(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode *</label>
                      <input
                        type="text"
                        required
                        value={recipientPincode}
                        onChange={(e) => setRecipientPincode(e.target.value)}
                        className="w-full px-3 py-2 font-mono font-bold text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Specs & Service Tier */}
              <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-secondary flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h2 className="font-headline font-bold text-base text-slate-900">
                    Consignment Specs & Service Selection
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Service Tier</label>
                    <select
                      value={serviceCode}
                      onChange={(e) => setServiceCode(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none font-medium bg-slate-50"
                    >
                      <option value="cargo">Express Cargo (Priority Air/Linehaul)</option>
                      <option value="standard">Surface Standard (Ground)</option>
                      <option value="cold">Cold Chain (2°-8°C Reefer)</option>
                      <option value="intl">Global International Express</option>
                      <option value="hyper">Same-Day Hyperlocal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Packaging Form</label>
                    <select
                      value={packageType}
                      onChange={(e) => setPackageType(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none font-medium bg-slate-50"
                    >
                      <option value="carton">Corrugated Carton</option>
                      <option value="pallet">Euro Wooden Pallet</option>
                      <option value="tote">Sealed Secure Tote</option>
                      <option value="drum">Industrial Metal Drum</option>
                      <option value="flyer">Tamper-Proof Flyer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (KG)</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={actualWeight}
                      onChange={(e) => setActualWeight(Math.max(0.5, parseFloat(e.target.value) || 1))}
                      className="w-full px-2.5 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Declared Value (₹)</label>
                    <input
                      type="number"
                      value={declaredValue}
                      onChange={(e) => setDeclaredValue(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-2.5 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Length (cm)</label>
                    <input
                      type="number"
                      value={lengthCm}
                      onChange={(e) => setLengthCm(Math.max(1, parseInt(e.target.value) || 10))}
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Width (cm)</label>
                    <input
                      type="number"
                      value={widthCm}
                      onChange={(e) => setWidthCm(Math.max(1, parseInt(e.target.value) || 10))}
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Math.max(1, parseInt(e.target.value) || 10))}
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Live Price Summary & Confirm Button */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 sticky top-20">
                <h3 className="font-headline font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
                  Quotation Summary
                </h3>

                {rate && (
                  <div className="space-y-2 py-3 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span className="font-semibold text-slate-800">{rate.serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chargeable Weight:</span>
                      <span className="font-mono font-bold text-slate-800">{rate.chargeableWeightKg} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Freight:</span>
                      <span className="font-mono text-slate-800">₹{rate.baseFreight.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weight Surcharge:</span>
                      <span className="font-mono text-slate-800">₹{rate.weightSurcharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fuel FSC (4.2%):</span>
                      <span className="font-mono text-slate-800">₹{rate.fuelSurcharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Insurance:</span>
                      <span className="font-mono text-slate-800">₹{rate.insuranceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18%):</span>
                      <span className="font-mono text-slate-800">₹{rate.taxGst.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between pt-3 border-t border-slate-200 text-sm font-bold text-slate-900 items-baseline">
                      <span>Total (Incl. Tax):</span>
                      <span className="text-xl text-teal-700 font-headline font-bold">
                        ₹{rate.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-2">
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full py-3 px-4 rounded-lg bg-secondary text-white font-headline font-bold text-sm hover:bg-secondary-hover transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {bookingLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4" />
                        <span>Confirm & Generate AWB</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Success Modal */}
        {bookingSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-headline font-bold text-xl text-slate-900">
                Consignment Created!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your unique Air Waybill (AWB) is registered in the central logistics database.
              </p>

              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">AWB Number:</span>
                  <span className="font-mono text-sm font-bold text-teal-700">{bookingSuccess.awb}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Ref:</span>
                  <span className="font-mono font-semibold">{bookingSuccess.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Freight:</span>
                  <span className="font-bold text-slate-900">₹{bookingSuccess.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowLabelModal(true)}
                  className="py-2.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <QrCode className="w-4 h-4 text-secondary" />
                  <span>Print Label</span>
                </button>
                <a
                  href={`/track?awb=${encodeURIComponent(bookingSuccess.awb)}`}
                  className="py-2.5 px-3 rounded-lg bg-secondary text-white text-xs font-bold hover:bg-secondary-hover transition-colors flex items-center justify-center gap-1"
                >
                  <span>Track Consignment</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        {showLabelModal && (
          <ShippingLabelModal
            awb={bookingSuccess.awb}
            shipment={{
              awb: bookingSuccess.awb,
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
              serviceName: serviceCode === "cargo" ? "Express Cargo" : "Surface Standard",
              chargeableWeightKg: actualWeight,
              piecesCount,
              dockGate,
              pickupDate,
              pickupSlot,
            }}
            onClose={() => setShowLabelModal(false)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
