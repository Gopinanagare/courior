import { NextRequest, NextResponse } from "next/server";
import { calculateShippingRate } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      serviceCode = "cargo",
      actualWeightKg = 10,
      lengthCm = 20,
      widthCm = 20,
      heightCm = 20,
      declaredValue = 0,
      originPincode,
      destinationPincode,
      paymentMode = "prepaid",
      codAmount = 0,
    } = body;

    const calculation = calculateShippingRate({
      serviceCode,
      actualWeightKg: Math.max(0.1, Number(actualWeightKg) || 1),
      lengthCm: Math.max(1, Number(lengthCm) || 10),
      widthCm: Math.max(1, Number(widthCm) || 10),
      heightCm: Math.max(1, Number(heightCm) || 10),
      declaredValue: Number(declaredValue) || 0,
      originPincode,
      destinationPincode,
      paymentMode,
      codAmount: Number(codAmount) || 0,
    });

    return NextResponse.json({
      success: true,
      data: calculation,
    });
  } catch (error: any) {
    console.error("Calculator error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to calculate rate." },
      { status: 400 }
    );
  }
}
