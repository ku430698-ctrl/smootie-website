import { NextRequest } from "next/server";
import crypto from "crypto";

const SECRET =
  process.env.ADMIN_JWT_SECRET ||
  process.env.ADMIN_PASSCODE ||
  "kamal_verma_trading_secret_key_2026_sebi";

/**
 * Generate a cryptographically signed HMAC-SHA256 session token
 * Expiration defaults to 12 hours
 */
export function createAdminToken(hoursValid = 12): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    role: "admin",
    name: "Kamal Verma",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + hoursValid * 3600,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");

  return `${data}.${signature}`;
}

/**
 * Verifies the validity, signature, and expiration of an admin token
 */
export function verifyAdminToken(token: string | null | undefined): {
  valid: boolean;
  reason?: string;
  payload?: any;
} {
  if (!token || typeof token !== "string") {
    return { valid: false, reason: "Token missing" };
  }

  // 1. Support cryptographically signed JWT-style tokens
  const parts = token.split(".");
  if (parts.length === 3) {
    const [encodedHeader, encodedPayload, signature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;
    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(data)
      .digest("base64url");

    try {
      const sigBuf = Buffer.from(signature);
      const expectedBuf = Buffer.from(expectedSig);
      if (
        sigBuf.length !== expectedBuf.length ||
        !crypto.timingSafeEqual(sigBuf, expectedBuf)
      ) {
        return { valid: false, reason: "Invalid signature" };
      }

      const payload = JSON.parse(
        Buffer.from(encodedPayload, "base64url").toString("utf8")
      );
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < now) {
        return { valid: false, reason: "Token expired" };
      }

      if (payload.role !== "admin") {
        return { valid: false, reason: "Insufficient permissions" };
      }

      return { valid: true, payload };
    } catch {
      return { valid: false, reason: "Malformed token payload" };
    }
  }

  // 2. Legacy fallback token support during session migration (admin_authenticated_<timestamp>)
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    if (decoded.startsWith("admin_authenticated_")) {
      const timestamp = parseInt(decoded.replace("admin_authenticated_", ""), 10);
      const twelveHoursMs = 12 * 3600 * 1000;
      if (!isNaN(timestamp) && Date.now() - timestamp < twelveHoursMs) {
        return { valid: true, payload: { role: "admin", legacy: true } };
      }
      return { valid: false, reason: "Legacy session expired" };
    }
  } catch {
    // ignore
  }

  return { valid: false, reason: "Unrecognized token format" };
}

/**
 * Extracts and verifies the admin session from request headers or cookies
 */
export function authenticateAdminRequest(request: NextRequest): {
  authorized: boolean;
  error?: string;
} {
  // Check Authorization header (Bearer <token>)
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const result = verifyAdminToken(token);
    if (result.valid) return { authorized: true };
    return { authorized: false, error: `Unauthorized: ${result.reason || "Invalid credentials"}` };
  }

  // Check kv_admin_session Cookie
  const cookieToken = request.cookies.get("kv_admin_session")?.value;
  if (cookieToken) {
    const result = verifyAdminToken(cookieToken);
    if (result.valid) return { authorized: true };
    return { authorized: false, error: `Unauthorized: ${result.reason || "Session expired"}` };
  }

  return {
    authorized: false,
    error: "Unauthorized: Missing authentication credentials. Please log in.",
  };
}
