import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPageContent, savePageContent } from "@/lib/db";
import { authenticateAdminRequest } from "@/lib/auth";
import { sanitizeErrorMessage, sanitizePayload } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = authenticateAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") as "home" | "about" | "contact";
    if (!page || !["home", "about", "contact"].includes(page)) {
      return NextResponse.json(
        { success: false, error: "Valid page query param (home, about, contact) is required." },
        { status: 400 }
      );
    }

    const data = await getPageContent(page);
    return NextResponse.json({ success: true, page, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(err, "Failed to fetch page content.") },
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
    const { page, ...rest } = body || {};
    if (!page || !["home", "about", "contact"].includes(page)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing page parameter (must be home, about, or contact)." },
        { status: 400 }
      );
    }

    const payload = body.content && typeof body.content === "object" ? body.content : rest;
    const result = await savePageContent(page, payload);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    try {
      const targetPath = page === "home" ? "/" : `/${page}`;
      revalidatePath(targetPath);
      revalidatePath("/", "layout");
      revalidatePath("/api/content");
    } catch {
      // ignore
    }
    return NextResponse.json({ success: true, message: result.message, data: result.data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(err, "Failed to save page content.") },
      { status: 500 }
    );
  }
}
