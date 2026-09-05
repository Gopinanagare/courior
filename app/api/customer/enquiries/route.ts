import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateTicketNumber } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const enquiries = db.prepare(`
      SELECT * FROM enquiries 
      WHERE user_id = ? OR email = ? 
      ORDER BY created_at DESC
    `).all(session.id, session.email);

    return NextResponse.json({
      success: true,
      data: enquiries,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSession(req);
    const body = await req.json();
    const {
      name,
      email,
      phone,
      awb_number,
      subject,
      category = "General Inquiry",
      message,
      priority = "normal",
    } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "Name, email, subject, and message are required." },
        { status: 400 }
      );
    }

    const ticketNumber = generateTicketNumber();
    const userId = session ? session.id : null;

    db.prepare(`
      INSERT INTO enquiries (
        ticket_number, user_id, name, email, phone, awb_number,
        subject, category, message, status, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)
    `).run(
      ticketNumber,
      userId,
      name.trim(),
      email.trim().toLowerCase(),
      phone ? phone.trim() : "",
      awb_number ? awb_number.trim().toUpperCase() : null,
      subject.trim(),
      category,
      message.trim(),
      priority
    );

    return NextResponse.json({
      success: true,
      message: `Support ticket ${ticketNumber} created successfully. Our team will review shortly.`,
      ticketNumber,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
