"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { Menu, X } from "lucide-react";
import { useSiteContent } from "@/lib/useSiteContent";
import MarketBrandLogo from "@/components/MarketBrandLogo";

const DEFAULT_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { settings } = useSiteContent();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);

  const navLinks = settings?.navItems && settings.navItems.length > 0 ? settings.navItems : DEFAULT_NAV_LINKS;

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(navRef.current,
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.1 }
      );
    });
    return () => ctx.revert();
  }, []);

  // Mobile menu animation
  useEffect(() => {
    if (!mobileRef.current) return;
    if (open) {
      gsap.fromTo(mobileRef.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.35, ease: "power2.out" }
      );
      gsap.fromTo(mobileRef.current.querySelectorAll("li"),
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.07, duration: 0.3, ease: "power2.out", delay: 0.1 }
      );
    } else {
      gsap.to(mobileRef.current, { height: 0, opacity: 0, duration: 0.25, ease: "power2.in" });
    }
  }, [open]);

  return (
    <nav
      ref={navRef}
      className="navbar"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px" }}>
        {/* Logo */}
        <div ref={logoRef}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <MarketBrandLogo size={40} />
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                {settings.websiteName || "Kamal Verma"}
              </div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {settings.logoSubtext || "Trading Mentor"}
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Links */}
        <ul ref={linksRef} style={{ display: "flex", gap: "4px", listStyle: "none", alignItems: "center" }} className="desktop-nav">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                style={{
                  display: "block",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-full)",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  textDecoration: "none",
                  color: pathname === l.href ? "var(--brand-primary)" : "var(--text-secondary)",
                  background: pathname === l.href ? "var(--brand-primary-light)" : "transparent",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (pathname !== l.href) {
                    (e.currentTarget as HTMLElement).style.color = "var(--brand-primary)";
                    (e.currentTarget as HTMLElement).style.background = "var(--brand-primary-mid)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== l.href) {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/contact" className="btn-primary" style={{ padding: "9px 22px", fontSize: "0.84rem" }}>
            Book a Call
          </Link>
          <button
            id="nav-mobile-toggle"
            onClick={() => setOpen(!open)}
            style={{
              display: "none", background: "rgba(59,91,219,0.08)",
              border: "1px solid rgba(59,91,219,0.15)", borderRadius: "8px",
              padding: "8px", cursor: "pointer", color: "var(--brand-primary)"
            }}
            aria-label="Toggle menu"
            className="mobile-toggle"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div ref={mobileRef} style={{ overflow: "hidden", height: 0, opacity: 0 }}>
        <ul style={{ listStyle: "none", padding: "12px 24px 20px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                style={{
                  display: "block", padding: "11px 16px", borderRadius: "var(--radius-sm)",
                  fontWeight: 600, fontSize: "0.92rem", textDecoration: "none",
                  color: pathname === l.href ? "var(--brand-primary)" : "var(--text-secondary)",
                  background: pathname === l.href ? "var(--brand-primary-light)" : "transparent",
                }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
