import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";

import { getSiteSettings } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSiteSettings();
    const seoHome = settings.seo?.home;
    const siteTitle = seoHome?.title || `${settings.websiteName || "Kamal Verma"} | Trading Mentor & Financial Markets Educator`;
    const siteDesc =
      seoHome?.description ||
      "Official portfolio of Kamal Verma, Trading Mentor and Financial Markets Educator with 6 years experience, guiding 1,000+ people across Stock Market, Forex, and Cryptocurrency.";

    return {
      metadataBase: new URL("http://localhost:3000"),
      title: siteTitle,
      description: siteDesc,
      keywords: [
        settings.websiteName || "Kamal Verma",
        "Trading Mentor",
        "Financial Markets Educator",
        "Stock Market Education",
        "Forex Trading Mentor",
        "Cryptocurrency Analysis",
        "Technical Analysis Training",
      ],
      authors: [{ name: settings.websiteName || "Kamal Verma" }],
      openGraph: {
        title: siteTitle,
        description: siteDesc,
        images: [{ url: "/images/kamal-verma-professional.jpg", width: 768, height: 1024, alt: `${settings.websiteName || "Kamal Verma"} - Trading Mentor` }],
        type: "website",
      },
    };
  } catch {
    return {
      metadataBase: new URL("http://localhost:3000"),
      title: "Kamal Verma | Trading Mentor & Financial Markets Educator",
      description: "Official portfolio of Kamal Verma, Trading Mentor and Financial Markets Educator with 6 years experience, guiding 1,000+ people across Stock Market, Forex, and Cryptocurrency.",
    };
  }
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

import LayoutShell from "@/components/LayoutShell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
