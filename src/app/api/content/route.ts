import { NextResponse } from "next/server";
import {
  getSiteSettings,
  getPageContent,
  getServicesCMS,
  getPortfolioCMS,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [settings, home, about, contact, services, portfolio] = await Promise.all([
      getSiteSettings(),
      getPageContent("home"),
      getPageContent("about"),
      getPageContent("contact"),
      getServicesCMS(false),
      getPortfolioCMS(false),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          settings,
          home,
          about,
          contact,
          services,
          portfolio,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch public site content." },
      { status: 500 }
    );
  }
}
