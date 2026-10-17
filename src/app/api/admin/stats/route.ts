import { NextRequest, NextResponse } from "next/server";
import { getAdminStats } from "@/lib/db";
import { authenticateAdminRequest } from "@/lib/auth";
import { sanitizeErrorMessage } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = authenticateAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const stats = await getAdminStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error, "Failed to fetch administrative stats.") },
      { status: 500 }
    );
  }
}
