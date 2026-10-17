import { NextRequest, NextResponse } from "next/server";
import { saveSubscriber } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sanitizeErrorMessage, sanitizePayload } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  // Rate limiting: 5 subscriptions per 10 minutes per IP
  const rate = checkRateLimit(`newsletter_submit:${clientIp}`, 5, 10 * 60);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many subscription attempts. Please wait a few minutes before trying again.",
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
    const { email } = body || {};

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

    const cleanEmail = email.trim().toLowerCase().slice(0, 100);
    const result = await saveSubscriber(cleanEmail, "footer_newsletter");

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Please provide a valid email address." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      savedToDb: result.savedToDb,
      alreadySubscribed: result.alreadySubscribed,
    });
  } catch (error) {
    console.error("API /newsletter error:", error);
    return NextResponse.json(
      {
        success: false,
        error: sanitizeErrorMessage(error, "Failed to process newsletter subscription."),
      },
      { status: 500 }
    );
  }
}
