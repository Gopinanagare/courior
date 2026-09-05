import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyPassword, signToken, logAudit } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ? AND is_active = 1").get(email.toLowerCase().trim()) as any;
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      company_name: user.company_name,
      branch_id: user.branch_id,
    };

    const token = signToken(sessionUser);

    logAudit(
      user.id,
      user.name,
      user.role,
      "USER_LOGIN",
      "USER",
      String(user.id),
      `User ${user.email} logged in successfully.`
    );

    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully.",
      user: sessionUser,
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
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to log in." },
      { status: 500 }
    );
  }
}
