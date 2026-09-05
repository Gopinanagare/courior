import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const services = db.prepare("SELECT * FROM courier_services WHERE is_active = 1 ORDER BY id ASC").all();
    const branches = db.prepare("SELECT id, code, name, city, state, pincode, dock_gates, contact_name, contact_phone FROM branches WHERE is_active = 1 ORDER BY city ASC").all();

    return NextResponse.json({
      success: true,
      services,
      branches,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load services." },
      { status: 500 }
    );
  }
}
