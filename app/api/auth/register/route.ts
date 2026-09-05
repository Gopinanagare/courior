import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone, company_name, gstin, role = "customer" } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase().trim());
    if (existing) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = hashPassword(password);
    const assignedRole = role === "super_admin" || role === "operations" ? "customer" : role; // Protect privilege escalation on public register

    const stmt = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone, company_name, gstin)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      email.toLowerCase().trim(),
      password_hash,
      assignedRole,
      phone || null,
      company_name || null,
      gstin || null
    );

    const newUser = {
      id: Number(result.lastInsertRowid),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: assignedRole as any,
      phone,
      company_name,
    };

    const token = signToken(newUser);

    const response = NextResponse.json({
      success: true,
      message: "Account registered successfully.",
      user: newUser,
      token,
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to register account." },
      { status: 500 }
    );
  }
}
