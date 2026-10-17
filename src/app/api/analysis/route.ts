import { NextRequest, NextResponse } from "next/server";
import { getMarketInsights } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;

    const insights = await getMarketInsights(category);
    return NextResponse.json({ success: true, count: insights.length, data: insights });
  } catch (error) {
    console.error("API /analysis error:", error);
    return NextResponse.json(
      { error: "Failed to fetch market insights." },
      { status: 500 }
    );
  }
}
