import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth, hashPassword, logAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ["super_admin"]);
    if (errorResponse) return errorResponse;

    const users = db.prepare(`
      SELECT u.id, u.name, u.email, u.role, u.phone, u.company_name, u.gstin, u.branch_id, u.is_active, u.created_at,
             b.name as branch_name, b.code as branch_code
      FROM users u
      LEFT JOIN branches b ON u.branch_id = b.id
      ORDER BY u.id ASC
    `).all();

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user: currentAdmin, errorResponse } = requireAuth(req, ["super_admin"]);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { name, email, password, role, phone, company_name, gstin, branch_id } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, message: "Name, email, password, and role are required." }, { status: 400 });
    }

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase().trim());
    if (existing) {
      return NextResponse.json({ success: false, message: "Email already registered." }, { status: 409 });
    }

    const password_hash = hashPassword(password);
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone, company_name, gstin, branch_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      email.toLowerCase().trim(),
      password_hash,
      role,
      phone ? phone.trim() : null,
      company_name ? company_name.trim() : null,
      gstin ? gstin.trim() : null,
      branch_id || null
    );

    logAudit(
      currentAdmin?.id || null,
      currentAdmin?.name || "Super Admin",
      "super_admin",
      "CREATE_USER",
      "USER",
      String(result.lastInsertRowid),
      `Created staff user ${email} with role '${role}'.`
    );

    return NextResponse.json({ success: true, message: `User ${name} created successfully.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user: currentAdmin, errorResponse } = requireAuth(req, ["super_admin"]);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { id, name, role, phone, company_name, branch_id, is_active, password } = body;

    if (password && password.trim().length > 0) {
      const newHash = hashPassword(password.trim());
      db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(newHash, id);
    }

    db.prepare(`
      UPDATE users SET
        name = ?,
        role = ?,
        phone = ?,
        company_name = ?,
        branch_id = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, role, phone, company_name, branch_id || null, is_active ? 1 : 0, id);

    logAudit(
      currentAdmin?.id || null,
      currentAdmin?.name || "Super Admin",
      "super_admin",
      "UPDATE_USER",
      "USER",
      String(id),
      `Updated user #${id} (${name}, Role: ${role}, Active: ${is_active})`
    );

    return NextResponse.json({ success: true, message: "User updated successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
