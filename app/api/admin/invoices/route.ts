import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth, logAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["super_admin", "operations", "accounts"]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'invoices' or 'cod'

    if (type === "cod") {
      const codShipments = db.prepare(`
        SELECT 
          s.id, s.awb_number, s.sender_name, s.sender_city, s.recipient_name, s.recipient_city,
          s.cod_amount, s.cod_status, s.status as shipment_status, s.created_at,
          u.name as customer_name
        FROM shipments s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.payment_mode = 'cod'
        ORDER BY s.created_at DESC
      `).all();

      return NextResponse.json({ success: true, data: codShipments });
    }

    const invoices = db.prepare(`
      SELECT 
        i.*,
        s.sender_name, s.sender_city, s.recipient_name, s.recipient_city, s.service_name,
        u.name as customer_name, u.email as customer_email
      FROM invoices i
      LEFT JOIN shipments s ON i.shipment_id = s.id
      LEFT JOIN users u ON i.user_id = u.id
      ORDER BY i.issued_at DESC
    `).all();

    return NextResponse.json({ success: true, data: invoices });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, errorResponse } = requireAuth(req, ["super_admin", "accounts"]);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { type, id, cod_status, payment_status } = body;

    if (type === "cod") {
      db.prepare("UPDATE shipments SET cod_status = ? WHERE id = ?").run(cod_status, id);
      const ship = db.prepare("SELECT awb_number FROM shipments WHERE id = ?").get(id) as any;
      logAudit(
        user?.id || null,
        user?.name || "Accounts",
        user?.role || "accounts",
        "UPDATE_COD_STATUS",
        "COD",
        ship?.awb_number || String(id),
        `COD status updated to '${cod_status}' for shipment #${id}.`
      );
      return NextResponse.json({ success: true, message: "COD status updated." });
    }

    if (type === "invoice") {
      db.prepare("UPDATE invoices SET payment_status = ? WHERE id = ?").run(payment_status, id);
      const inv = db.prepare("SELECT invoice_number FROM invoices WHERE id = ?").get(id) as any;
      logAudit(
        user?.id || null,
        user?.name || "Accounts",
        user?.role || "accounts",
        "UPDATE_INVOICE_STATUS",
        "INVOICE",
        inv?.invoice_number || String(id),
        `Invoice #${id} payment status changed to '${payment_status}'.`
      );
      return NextResponse.json({ success: true, message: "Invoice status updated." });
    }

    return NextResponse.json({ success: false, message: "Invalid type." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
