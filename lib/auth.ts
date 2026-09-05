import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import db from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "exolent_express_ultra_secure_secret_key_2024_x99";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: "super_admin" | "operations" | "branch_manager" | "support" | "accounts" | "customer";
  phone?: string;
  company_name?: string;
  branch_id?: number;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch_id: user.branch_id,
      company_name: user.company_name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export function getSession(req: NextRequest): SessionUser | null {
  // 1. Check Bearer Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  // 2. Check auth_token cookie
  const cookieToken = req.cookies.get("auth_token")?.value;
  if (cookieToken) {
    return verifyToken(cookieToken);
  }

  return null;
}

export function requireAuth(
  req: NextRequest,
  allowedRoles?: string[]
): { user: SessionUser | null; errorResponse: NextResponse | null } {
  const user = getSession(req);
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, message: `Forbidden. Role '${user.role}' cannot perform this action.` },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}

export function logAudit(
  userId: number | null,
  userName: string,
  userRole: string,
  action: string,
  entityType: string,
  entityId: string,
  details: string,
  ipAddress = "127.0.0.1"
) {
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (user_id, user_name, user_role, action, entity_type, entity_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(userId, userName, userRole, action, entityType, entityId, details, ipAddress);
  } catch (err) {
    console.error("Audit log error:", err);
  }
}
