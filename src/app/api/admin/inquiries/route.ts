import { NextRequest, NextResponse } from "next/server";
import { getInquiries, updateInquiry, deleteInquiry } from "@/lib/db";
import { authenticateAdminRequest } from "@/lib/auth";
import { isValidId, sanitizeErrorMessage } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = authenticateAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const inquiries = await getInquiries();
    return NextResponse.json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error, "Failed to fetch inquiries.") },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = authenticateAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON payload provided." }, { status: 400 });
  }

  try {
    const { id, status, notes } = body;

    if (!id || !isValidId(id)) {
      return NextResponse.json(
        { success: false, error: "Valid Inquiry ID is required." },
        { status: 400 }
      );
    }

    if (status && !["pending", "contacted", "enrolled"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Status must be 'pending', 'contacted', or 'enrolled'." },
        { status: 400 }
      );
    }

    const result = await updateInquiry(id, {
      ...(status ? { status } : {}),
      ...(notes !== undefined ? { notes: String(notes).slice(0, 1000) } : {}),
    });

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message });
    }
    if (result.notFound) {
      return NextResponse.json({ success: false, error: result.message }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: result.message }, { status: 500 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error, "Failed to update inquiry.") },
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
      return NextResponse.json(
        { success: false, error: "Valid Inquiry ID is required." },
        { status: 400 }
      );
    }

    const result = await deleteInquiry(id);
    if (result.success) {
      return NextResponse.json({ success: true, message: result.message });
    }
    if (result.notFound) {
      return NextResponse.json({ success: false, error: result.message }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: result.message }, { status: 500 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error, "Failed to delete inquiry.") },
      { status: 500 }
    );
  }
}
