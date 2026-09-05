import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const addresses = db.prepare("SELECT * FROM saved_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC").all(session.id);

    return NextResponse.json({
      success: true,
      data: addresses,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const {
      type = "both",
      label,
      contact_name,
      phone,
      email,
      company_name,
      address,
      landmark,
      city,
      state,
      pincode,
      gstin,
      is_default = 0,
    } = body;

    if (!contact_name || !phone || !address || !city || !pincode) {
      return NextResponse.json(
        { success: false, message: "Contact name, phone, address, city, and pincode are required." },
        { status: 400 }
      );
    }

    if (is_default === 1) {
      db.prepare("UPDATE saved_addresses SET is_default = 0 WHERE user_id = ?").run(session.id);
    }

    const stmt = db.prepare(`
      INSERT INTO saved_addresses (
        user_id, type, label, contact_name, phone, email, company_name,
        address, landmark, city, state, pincode, gstin, is_default
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      session.id,
      type,
      label || contact_name,
      contact_name.trim(),
      phone.trim(),
      email ? email.trim() : null,
      company_name ? company_name.trim() : null,
      address.trim(),
      landmark ? landmark.trim() : null,
      city.trim(),
      state || "",
      pincode.trim(),
      gstin ? gstin.trim() : null,
      is_default ? 1 : 0
    );

    return NextResponse.json({
      success: true,
      message: "Address saved to address book.",
      data: { id: result.lastInsertRowid },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Address ID is required." }, { status: 400 });
    }

    db.prepare("DELETE FROM saved_addresses WHERE id = ? AND user_id = ?").run(id, session.id);

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
