import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSiteSettings, saveSiteSettings } from "@/lib/db";
import { authenticateAdminRequest } from "@/lib/auth";
import { sanitizeErrorMessage, sanitizePayload } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = authenticateAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const settings = await getSiteSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(err, "Failed to fetch settings.") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = authenticateAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  let rawBody: any;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON payload provided." }, { status: 400 });
  }

  const body = sanitizePayload(rawBody);

  try {
    const result = await saveSiteSettings(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    try {
      revalidatePath("/", "layout");
      revalidatePath("/api/content");
    } catch {
      // ignore
    }
    return NextResponse.json({ success: true, message: result.message, data: result.data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(err, "Failed to save site settings.") },
      { status: 500 }
    );
  }
}
