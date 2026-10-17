import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminToken } from "@/lib/auth";
import { checkRateLimit, resetRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Default admin passcode for Kamal Verma: "kamal2026" (or configurable via env)
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "kamal2026";

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimitKey = `admin_auth:${clientIp}`;

  // Rate limiting: 5 attempts per 15 minutes
  const rate = checkRateLimit(rateLimitKey, 5, 15 * 60);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Too many login attempts. Please wait ${Math.ceil(
          rate.resetSeconds / 60
        )} minute(s) before trying again.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": rate.resetSeconds.toString(),
        },
      }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request payload provided." },
      { status: 400 }
    );
  }

  const { passcode } = body || {};

  if (!passcode || typeof passcode !== "string") {
    return NextResponse.json(
      { success: false, error: "Admin passcode is required." },
      { status: 400 }
    );
  }

  // Constant-time comparison to prevent timing attacks
  const passBuffer = Buffer.from(passcode);
  const expectedBuffer = Buffer.from(ADMIN_PASSCODE);
  const isMatch =
    passBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(passBuffer, expectedBuffer);

  if (isMatch) {
    // Reset rate limiter on successful login
    resetRateLimit(rateLimitKey);

    const token = createAdminToken(12);

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      token,
      adminName: "Kamal Verma",
    });

    // Set secure HttpOnly cookie for server-side authorization
    response.cookies.set("kv_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 3600, // 12 hours
    });

    return response;
  }

  return NextResponse.json(
    {
      success: false,
      error: `Invalid admin passcode. ${rate.remaining} attempt(s) remaining.`,
    },
    { status: 401 }
  );
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  // Clear session cookie
  response.cookies.set("kv_admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
