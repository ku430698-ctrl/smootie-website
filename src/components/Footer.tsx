"use client";

import Link from "next/link";
import { Phone, Shield } from "lucide-react";
import { EXPERT_INFO } from "@/lib/data";
import { useSiteContent } from "@/lib/useSiteContent";
import MarketBrandLogo from "@/components/MarketBrandLogo";

export default function Footer() {
  const { settings } = useSiteContent();

  const navLinks = settings?.navItems && settings.navItems.length > 0 ? settings.navItems : [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px", marginBottom: "36px" }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <MarketBrandLogo size={36} />
              <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)" }}>
                {settings.websiteName || "Kamal Verma"}
              </span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.65", maxWidth: "240px" }}>
              {settings.footerText || "Trading mentor & financial markets educator. 6 years experience. 1,000+ people guided."}
            </p>
            <a href={`tel:${settings.phone || EXPERT_INFO.phone}`} style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              marginTop: "14px", fontSize: "0.88rem", fontWeight: 600,
              color: "var(--brand-primary)", textDecoration: "none"
            }}>
              <Phone size={14} /> +91 {settings.phone || EXPERT_INFO.phone}
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.80rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "14px" }}>Navigate</p>
            {navLinks.map((l) => (
              <div key={l.href} style={{ marginBottom: "8px" }}>
                <Link href={l.href} style={{ fontSize: "0.88rem", color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}>
                  {l.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Markets */}
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.80rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "14px" }}>Markets Covered</p>
            {["Stock Market (Equities)", "Forex (Currency Pairs)", "Cryptocurrency"].map((m) => (
              <div key={m} style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "8px" }}>{m}</div>
            ))}
          </div>

          {/* Legal */}
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.80rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "14px" }}>Important</p>
            <div style={{
              background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)",
              borderRadius: "10px", padding: "12px 14px", fontSize: "0.76rem", color: "#92400e", lineHeight: "1.6"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, marginBottom: "6px" }}>
                <Shield size={12} /> Educational Content Only
              </div>
              All content is for educational purposes. Not registered investment advice. Trading involves risk.
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-card)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
          <p style={{ fontSize: "0.80rem", color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Kamal Verma. Educational content only.
          </p>
          <p style={{ fontSize: "0.80rem", color: "var(--text-muted)" }}>
            Not SEBI registered. For educational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
