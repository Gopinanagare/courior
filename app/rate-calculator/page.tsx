"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Calculator, ArrowRight, CheckCircle2, AlertCircle, Box, MapPin, Shield } from "lucide-react";

export default function RateCalculatorPage() {
  const [serviceCode, setServiceCode] = useState("cargo");
  const [actualWeight, setActualWeight] = useState(10);
  const [lengthCm, setLengthCm] = useState(30);
  const [widthCm, setWidthCm] = useState(25);
  const [heightCm, setHeightCm] = useState(20);
  const [declaredValue, setDeclaredValue] = useState(5000);
  const [originPincode, setOriginPincode] = useState("560066");
  const [destinationPincode, setDestinationPincode] = useState("400072");
  const [paymentMode, setPaymentMode] = useState<"prepaid" | "cod" | "to_pay">("prepaid");
  const [codAmount, setCodAmount] = useState(0);

  const [rate, setRate] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    computeRate();
  }, [serviceCode, actualWeight, lengthCm, widthCm, heightCm, declaredValue, originPincode, destinationPincode, paymentMode, codAmount]);

  const computeRate = async () => {
    setLoading(true);
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
          originPincode,
          destinationPincode,
          paymentMode,
          codAmount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRate(data.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      <main className="w-full pt-20 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
            Tariff Engine v4.1
          </span>
          <h1 className="font-headline font-bold text-2xl sm:text-3xl text-slate-900 mt-1">
            Freight & Rate Estimator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Calculate instant quotation including dimensional weight cubing, fuel surcharge (FSC), cargo insurance, and zone routing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          {/* Config Card (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h2 className="font-headline font-bold text-base text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Box className="w-4 h-4 text-teal-600" />
              <span>Consignment & Package Parameters</span>
            </h2>

            {/* Service */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Service Tier</label>
              <select
                value={serviceCode}
                onChange={(e) => setServiceCode(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none font-medium bg-slate-50"
              >
                <option value="cargo">Express Cargo (Priority Air / Linehaul ~24-30 Hrs)</option>
                <option value="standard">Surface Standard (Consolidated Ground ~48-60 Hrs)</option>
                <option value="cold">Cold Chain 2°-8°C (Reefer Network ~28-36 Hrs)</option>
                <option value="intl">Global International Express (~3-5 Days)</option>
                <option value="hyper">Same-Day Hyperlocal (~4-8 Hrs)</option>
              </select>
            </div>

            {/* Pincodes */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Origin Pincode</label>
                <input
                  type="text"
                  value={originPincode}
                  onChange={(e) => setOriginPincode(e.target.value)}
                  placeholder="560066"
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Pincode</label>
                <input
                  type="text"
                  value={destinationPincode}
                  onChange={(e) => setDestinationPincode(e.target.value)}
                  placeholder="400072"
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Weight */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Actual Dead Weight</span>
                <span className="font-mono text-teal-700 font-bold">{actualWeight} KG</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="500"
                step="0.5"
                value={actualWeight}
                onChange={(e) => setActualWeight(parseFloat(e.target.value))}
                className="w-full accent-secondary"
              />
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Dimensions (cm)</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block">Length</span>
                  <input
                    type="number"
                    value={lengthCm}
                    onChange={(e) => setLengthCm(Math.max(1, parseInt(e.target.value) || 10))}
                    className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-200"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Width</span>
                  <input
                    type="number"
                    value={widthCm}
                    onChange={(e) => setWidthCm(Math.max(1, parseInt(e.target.value) || 10))}
                    className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-200"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Height</span>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Math.max(1, parseInt(e.target.value) || 10))}
                    className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Declared Value & Payment Mode */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Declared Value (₹)</label>
                <input
                  type="number"
                  value={declaredValue}
                  onChange={(e) => setDeclaredValue(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50"
                >
                  <option value="prepaid">Prepaid / Corporate Credit</option>
                  <option value="cod">Cash on Delivery (COD)</option>
                  <option value="to_pay">To-Pay (Consignee Billed)</option>
                </select>
              </div>
            </div>

            {paymentMode === "cod" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">COD Collection Amount (₹)</label>
                <input
                  type="number"
                  value={codAmount}
                  onChange={(e) => setCodAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200"
                />
              </div>
            )}
          </div>

          {/* Breakdown Card (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-headline font-bold text-base text-slate-900">Quotation Breakdown</h3>
              <span className="font-mono text-[10px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded font-bold border border-teal-200">
                1:5000 Cubing
              </span>
            </div>

            {rate && (
              <div className="space-y-3 py-4 text-xs text-slate-600">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex justify-between">
                    <span>Volumetric Weight:</span>
                    <span className="font-mono font-semibold">{rate.volumetricWeightKg} KG</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chargeable Weight:</span>
                    <span className="font-mono font-bold text-teal-700">{rate.chargeableWeightKg} KG</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Routing Corridor:</span>
                    <span>{rate.distanceZoneLabel}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span>Base Linehaul Freight:</span>
                  <span className="font-mono font-semibold text-slate-800">₹{rate.baseFreight.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Weight Slab Surcharge:</span>
                  <span className="font-mono font-semibold text-slate-800">₹{rate.weightSurcharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fuel Adjustment (FSC 4.2%):</span>
                  <span className="font-mono font-semibold text-slate-800">₹{rate.fuelSurcharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transit Goods Insurance:</span>
                  <span className="font-mono font-semibold text-slate-800">₹{rate.insuranceFee.toFixed(2)}</span>
                </div>
                {paymentMode === "cod" && (
                  <div className="flex justify-between">
                    <span>COD Processing Surcharge:</span>
                    <span className="font-mono font-semibold text-slate-800">₹{rate.codFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span className="font-mono font-semibold text-slate-800">₹{rate.taxGst.toFixed(2)}</span>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-200 items-baseline">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Total Net Amount:</span>
                  <span className="text-2xl font-headline font-bold text-teal-700">
                    ₹{rate.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="pt-3">
                  <Link
                    href="/book"
                    className="w-full py-3 px-4 rounded-lg bg-secondary text-white font-headline font-bold text-xs hover:bg-secondary-hover transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Proceed to Book Consignment</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
