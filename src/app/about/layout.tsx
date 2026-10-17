import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSiteSettings();
    const seo = settings.seo?.about;
    return {
      title: seo?.title || `About ${settings.websiteName || "Kamal Verma"} | Trading Mentor`,
      description:
        seo?.description ||
        "Learn about Kamal Verma's trading methodology, 6 years of stated experience, and disciplined risk-first education across Indian Equities, Forex, and Crypto.",
    };
  } catch {
    return {
      title: "About Kamal Verma | Trading Mentor",
      description: "Trading Mentor and Financial Markets Educator with 6 years experience.",
    };
  }
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
