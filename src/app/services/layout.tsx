import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSiteSettings();
    const seo = settings.seo?.services;
    return {
      title:
        seo?.title ||
        `Trading Education Programs & Mentorship | ${settings.websiteName || "Kamal Verma"}`,
      description:
        seo?.description ||
        "Structured educational programs for Stock Market, Forex, and Cryptocurrency traders. Analytical thinking, institutional price action, and risk management.",
    };
  } catch {
    return {
      title: "Trading Education Programs | Kamal Verma",
      description: "Structured educational programs for financial markets.",
    };
  }
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
