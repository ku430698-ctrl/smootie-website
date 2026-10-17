import { NextRequest, NextResponse } from "next/server";
import { saveInquiry } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sanitizeErrorMessage, sanitizePayload } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  // Rate limiting: 5 inquiries per 10 minutes per IP
  const rate = checkRateLimit(`contact_submit:${clientIp}`, 5, 10 * 60);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many contact submissions. Please wait a few minutes before trying again.",
      },
      {
        status: 429,
        headers: { "Retry-After": rate.resetSeconds.toString() },
      }
    );
  }

  let rawBody: any;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload provided." },
      { status: 400 }
    );
  }

  const body = sanitizePayload(rawBody);

  try {
    const { name, email, phone, experienceLevel, tradingCapital, serviceInterest, message } =
      body || {};

    // Server-side field validations
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Full name must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || phone.trim().replace(/\D/g, "").length < 8) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid contact number (at least 8 digits)." },
        { status: 400 }
      );
    }

    const result = await saveInquiry({
      name: name.trim().slice(0, 100),
      email: email.trim().toLowerCase().slice(0, 100),
      phone: phone.trim().slice(0, 25),
      experienceLevel:
        experienceLevel && ["beginner", "intermediate", "advanced"].includes(experienceLevel)
          ? experienceLevel
          : "beginner",
      tradingCapital: typeof tradingCapital === "string" ? tradingCapital.slice(0, 50) : "< ₹1 Lakh",
      serviceInterest:
        typeof serviceInterest === "string" ? serviceInterest.slice(0, 100) : "1-on-1 Trading Mentorship",
      message: typeof message === "string" ? message.trim().slice(0, 2000) : "",
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to process inquiry." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! Kamal Verma's desk will contact you within 24 hours.",
      inquiryId: result.id,
      savedToDb: result.savedToDb,
    });
  } catch (error) {
    console.error("API /contact error:", error);
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error, "Failed to submit inquiry.") },
      { status: 500 }
    );
  }
}
