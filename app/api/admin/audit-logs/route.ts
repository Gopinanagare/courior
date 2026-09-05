import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["super_admin", "operations"]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const limit = Math.max(10, Number(searchParams.get("limit")) || 50);

    const logs = db.prepare(`
      SELECT * FROM audit_logs 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(limit);

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
