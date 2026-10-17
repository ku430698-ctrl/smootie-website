import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSiteSettings();
    const seo = settings.seo?.contact;
    return {
      title:
        seo?.title ||
        `Contact & Educational Inquiry | ${settings.websiteName || "Kamal Verma"}`,
      description:
        seo?.description ||
        "Connect with Kamal Verma for educational guidance, 1-on-1 discovery calls, and program inquiries.",
    };
  } catch {
    return {
      title: "Contact & Educational Inquiry | Kamal Verma",
      description: "Connect for educational guidance and program inquiries.",
    };
  }
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
