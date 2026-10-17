import { NextRequest, NextResponse } from "next/server";
import { getMarketInsights, saveMarketInsight, deleteMarketInsight } from "@/lib/db";
import { authenticateAdminRequest } from "@/lib/auth";
import { isValidId, sanitizeErrorMessage, sanitizePayload } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = authenticateAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const insights = await getMarketInsights();
    return NextResponse.json({ success: true, count: insights.length, data: insights });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error, "Failed to fetch market insights.") },
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
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload provided." },
      { status: 400 }
    );
  }

  const body = sanitizePayload(rawBody);

  try {
    const { id, title, slug, category, summary, content, tags, readTime, date, featured } = body || {};

    if (id && !isValidId(id)) {
      return NextResponse.json({ success: false, error: "Invalid insight ID provided." }, { status: 400 });
    }

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json({ success: false, error: "Title must be at least 3 characters." }, { status: 400 });
    }

    const result = await saveMarketInsight({
      id,
      slug,
      title: title.trim(),
      category: category || "Index Analysis",
      summary: typeof summary === "string" ? summary.trim() : "",
      content: Array.isArray(content) ? content : [],
      tags: Array.isArray(tags) ? tags : [],
      readTime: readTime || "5 min read",
      date: date || new Date().toISOString().split("T")[0],
      featured: Boolean(featured),
    });

    if (!result.success) {
      if (result.conflict) {
        return NextResponse.json({ success: false, error: result.message }, { status: 409 });
      }
      return NextResponse.json({ success: false, error: result.message || "Failed to save insight." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      id: result.id,
      slug: result.slug,
      isUpdate: result.isUpdate,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error, "Failed to save insight.") },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = authenticateAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !isValidId(id)) {
      return NextResponse.json({ success: false, error: "Valid Insight ID is required." }, { status: 400 });
    }

    const result = await deleteMarketInsight(id);
    if (result.success) {
      return NextResponse.json({ success: true, message: result.message });
    }
    if (result.notFound) {
      return NextResponse.json({ success: false, error: result.message }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: result.message }, { status: 500 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error, "Failed to delete insight.") },
      { status: 500 }
    );
  }
}
