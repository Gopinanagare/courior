import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, user: null }, { status: 200 });
    }

    const user = db.prepare("SELECT id, name, email, role, phone, company_name, gstin, branch_id, created_at FROM users WHERE id = ?").get(session.id) as any;
    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}
