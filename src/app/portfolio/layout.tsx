import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSiteSettings();
    const seo = settings.seo?.portfolio;
    return {
      title:
        seo?.title ||
        `Trading Portfolio & Case Studies | ${settings.websiteName || "Kamal Verma"}`,
      description:
        seo?.description ||
        "Explore analytical case studies, technical breakdowns, and multi-market coverage by Kamal Verma across equities, currencies, and cryptocurrencies.",
    };
  } catch {
    return {
      title: "Trading Portfolio & Case Studies | Kamal Verma",
      description: "Analytical case studies and technical breakdowns.",
    };
  }
}

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
