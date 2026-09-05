"use client";

import React from "react";
import { X, Printer, Download, QrCode } from "lucide-react";

interface ShippingLabelModalProps {
  awb: string;
  shipment: any;
  onClose: () => void;
}

export default function ShippingLabelModal({ awb, shipment, onClose }: ShippingLabelModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-slate-300">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold font-headline uppercase tracking-wider">
              Official e-Way Shipping Manifest & Label
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Label</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-slate-800 text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Label Area */}
        <div className="p-6 bg-white text-slate-900 printable-area font-mono text-xs">
          {/* Label Header */}
          <div className="border-2 border-black p-4 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div>
                <h2 className="font-headline font-black text-lg tracking-tight text-black">
                  EXOLENT EXPRESS
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-slate-700">
                  Priority Linehaul & Freight
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 bg-black text-white font-bold text-xs">
                  {shipment?.serviceName || "EXPRESS CARGO"}
                </span>
                <p className="text-[10px] mt-0.5 font-bold">ROUTING: {shipment?.originHub?.code || "BLR"} → {shipment?.destHub?.code || "BOM"}</p>
              </div>
            </div>

            {/* Barcode Visual */}
            <div className="text-center py-2 border-b-2 border-black">
              {/* Simulated high-density Code 128 barcode lines */}
              <div className="h-12 w-full flex items-center justify-center gap-[2px] px-2 bg-slate-50 border border-slate-200">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-black h-9"
                    style={{
                      width: i % 3 === 0 ? "3px" : i % 5 === 0 ? "4px" : "1.5px",
                      opacity: i % 7 === 0 ? 0.3 : 1,
                    }}
                  />
                ))}
              </div>
              <p className="font-bold text-sm tracking-widest mt-1 text-black">
                {awb || "EXL-9024881-IN"}
              </p>
            </div>

            {/* Sender & Consignee Details */}
            <div className="grid grid-cols-2 gap-3 border-b-2 border-black pb-3">
              {/* From */}
              <div className="pr-2 border-r-2 border-black">
                <span className="text-[9px] uppercase tracking-wider font-bold block bg-slate-200 px-1 py-0.5 mb-1 text-black">
                  FROM (CONSIGNOR):
                </span>
                <p className="font-bold text-[11px] leading-tight text-black">{shipment?.senderName}</p>
                {shipment?.senderCompany && (
                  <p className="text-[10px] font-semibold text-slate-700">{shipment.senderCompany}</p>
                )}
                <p className="text-[10px] text-slate-800 leading-tight mt-0.5">{shipment?.senderAddress}</p>
                <p className="text-[10px] font-bold text-black mt-1">
                  {shipment?.senderCity}, {shipment?.senderState} - {shipment?.senderPincode}
                </p>
                <p className="text-[10px] text-slate-700">TEL: {shipment?.senderPhone}</p>
              </div>

              {/* To */}
              <div className="pl-1">
                <span className="text-[9px] uppercase tracking-wider font-bold block bg-black text-white px-1 py-0.5 mb-1">
                  SHIP TO (CONSIGNEE):
                </span>
                <p className="font-bold text-[11px] leading-tight text-black">{shipment?.recipientName}</p>
                {shipment?.recipientCompany && (
                  <p className="text-[10px] font-semibold text-slate-700">{shipment.recipientCompany}</p>
                )}
                <p className="text-[10px] text-slate-800 leading-tight mt-0.5">{shipment?.recipientAddress}</p>
                <p className="text-[11px] font-bold text-black mt-1">
                  {shipment?.recipientCity}, {shipment?.recipientState} - <span className="underline">{shipment?.recipientPincode}</span>
                </p>
                <p className="text-[10px] text-slate-700">TEL: {shipment?.recipientPhone}</p>
              </div>
            </div>

            {/* Consignment Metrics */}
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] border-b-2 border-black pb-3">
              <div className="border border-black p-1">
                <span className="text-[8px] uppercase block text-slate-600">Weight</span>
                <span className="font-bold text-black">{shipment?.chargeableWeightKg || 385} KG</span>
              </div>
              <div className="border border-black p-1">
                <span className="text-[8px] uppercase block text-slate-600">Pieces</span>
                <span className="font-bold text-black">{shipment?.piecesCount || 1} PKG</span>
              </div>
              <div className="border border-black p-1">
                <span className="text-[8px] uppercase block text-slate-600">Dock Bay</span>
                <span className="font-bold text-black">{shipment?.dockGate || "GATE D3"}</span>
              </div>
              <div className="border border-black p-1">
                <span className="text-[8px] uppercase block text-slate-600">Type</span>
                <span className="font-bold uppercase text-black">{shipment?.packageType || "PALLET"}</span>
              </div>
            </div>

            {/* Footer QR & Instructions */}
            <div className="flex items-center justify-between pt-1">
              <div className="space-y-0.5 text-[9px] text-slate-600">
                <p>• Verified e-Way Hub Manifest</p>
                <p>• Inspect container seal before signature</p>
                <p>• System: Exolent Express Logistics v4.1</p>
              </div>
              <div className="w-12 h-12 bg-black text-white p-1 flex items-center justify-center font-bold text-[9px] text-center">
                QR<br/>SEAL
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
