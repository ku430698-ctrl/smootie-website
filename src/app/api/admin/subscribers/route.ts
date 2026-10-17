import { NextRequest, NextResponse } from "next/server";
import { getSubscribers, deleteSubscriber } from "@/lib/db";
import { authenticateAdminRequest } from "@/lib/auth";
import { isValidId, sanitizeErrorMessage } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = authenticateAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const subscribers = await getSubscribers();
    return NextResponse.json({ success: true, count: subscribers.length, data: subscribers });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error, "Failed to fetch subscribers.") },
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
        { success: false, error: "Valid Subscriber ID is required." },
        { status: 400 }
      );
    }

    const result = await deleteSubscriber(id);
    if (result.success) {
      return NextResponse.json({ success: true, message: result.message });
    }
    if (result.notFound) {
      return NextResponse.json({ success: false, error: result.message }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: result.message }, { status: 500 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error, "Failed to delete subscriber.") },
      { status: 500 }
    );
  }
}
