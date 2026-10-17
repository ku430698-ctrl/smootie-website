import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServicesCMS, saveServiceCMS, deleteServiceCMS, reorderServicesCMS } from "@/lib/db";
import { authenticateAdminRequest } from "@/lib/auth";
import { isValidId, sanitizeErrorMessage, sanitizePayload } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = authenticateAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const services = await getServicesCMS(true);
    return NextResponse.json({ success: true, count: services.length, data: services });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(err, "Failed to fetch services.") },
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
    if (body.id && !isValidId(body.id)) {
      return NextResponse.json({ success: false, error: "Invalid service ID provided." }, { status: 400 });
    }

    const result = await saveServiceCMS(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    try {
      revalidatePath("/services");
      revalidatePath("/");
      revalidatePath("/api/content");
    } catch {}
    return NextResponse.json({ success: true, message: result.message, id: result.id });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(err, "Failed to save service.") },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    // Action: Reorder
    if (body.action === "reorder" && Array.isArray(body.orderedIds)) {
      const validIds = body.orderedIds.filter((id: any) => isValidId(id));
      const result = await reorderServicesCMS(validIds);
      try {
        revalidatePath("/services");
        revalidatePath("/");
        revalidatePath("/api/content");
      } catch {}
      return NextResponse.json({ success: true, message: result.message });
    }

    // Action: Toggle Publish
    if (body.id && body.published !== undefined) {
      if (!isValidId(body.id)) {
        return NextResponse.json({ success: false, error: "Invalid service ID." }, { status: 400 });
      }

      const result = await saveServiceCMS({ id: body.id, published: Boolean(body.published) });
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      try {
        revalidatePath("/services");
        revalidatePath("/");
        revalidatePath("/api/content");
      } catch {}
      return NextResponse.json({ success: true, message: "Service visibility updated." });
    }

    return NextResponse.json({ success: false, error: "Invalid patch payload." }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(err, "Failed to update service.") },
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
      return NextResponse.json({ success: false, error: "Valid Service ID is required." }, { status: 400 });
    }

    const result = await deleteServiceCMS(id);
    if (!result.success) {
      if (result.notFound) {
        return NextResponse.json({ success: false, error: result.message }, { status: 404 });
      }
      return NextResponse.json({ success: false, error: result.message }, { status: 500 });
    }
    try {
      revalidatePath("/services");
      revalidatePath("/");
      revalidatePath("/api/content");
    } catch {}
    return NextResponse.json({ success: true, message: result.message });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(err, "Failed to delete service.") },
      { status: 500 }
    );
  }
}
