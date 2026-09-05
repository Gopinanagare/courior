import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get("pincode")?.trim();

    if (!pincode) {
      return NextResponse.json(
        { success: false, message: "Pincode parameter is required." },
        { status: 400 }
      );
    }

    const pin = db.prepare(`
      SELECT p.*, b.name as hub_name, b.code as hub_code, b.city as hub_city
      FROM pincodes p
      LEFT JOIN branches b ON p.hub_id = b.id
      WHERE p.pincode = ?
    `).get(pincode) as any;

    if (!pin) {
      return NextResponse.json({
        success: true,
        isServiceable: false,
        message: `Pincode ${pincode} is currently outside our direct express coverage corridor.`,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      isServiceable: pin.is_serviceable === 1,
      message: pin.is_serviceable === 1 ? `Pincode ${pincode} (${pin.city}, ${pin.state}) is fully serviceable.` : `Pincode ${pincode} is currently inactive.`,
      data: {
        pincode: pin.pincode,
        city: pin.city,
        state: pin.state,
        zone: pin.zone,
        hubName: pin.hub_name,
        hubCode: pin.hub_code,
        isCodAllowed: pin.is_cod_allowed === 1,
        isColdChainAllowed: pin.is_cold_chain_allowed === 1,
        deliveryDaysStd: pin.delivery_days_std,
        deliveryDaysExp: pin.delivery_days_exp,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to check serviceability." },
      { status: 500 }
    );
  }
}
