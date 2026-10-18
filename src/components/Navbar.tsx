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
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px" }}>
        {/* Logo */}
        <div ref={logoRef}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <MarketBrandLogo size={38} />
            <div>
              <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                {settings.websiteName || "Kamal Verma"}
              </div>
              <div style={{ fontSize: "0.66rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
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

        {/* CTA & Mobile Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/contact" className="btn-primary desktop-cta" style={{ padding: "9px 22px", fontSize: "0.84rem" }}>
            Book a Call
          </Link>
          <button
            id="nav-mobile-toggle"
            onClick={() => setOpen(!open)}
            style={{
              display: "none",
              background: open ? "rgba(37, 99, 235, 0.20)" : "rgba(255, 255, 255, 0.06)",
              border: open ? "1px solid rgba(59, 130, 246, 0.40)" : "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "10px",
              padding: "9px",
              cursor: "pointer",
              color: open ? "#60a5fa" : "#ffffff",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            aria-label="Toggle navigation menu"
            className="mobile-toggle"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* World-Class Executive Mobile Menu Drawer */}
      <div
        ref={mobileRef}
        style={{
          overflow: "hidden",
          height: 0,
          opacity: 0,
          background: "rgba(10, 14, 24, 0.98)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.10)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.70)",
        }}
      >
        <div style={{ padding: "16px 20px 24px" }}>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px", margin: 0, padding: 0 }}>
            {navLinks.map((l) => {
              const isActive = pathname === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "13px 16px",
                      borderRadius: "12px",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      textDecoration: "none",
                      color: isActive ? "#ffffff" : "#94a3b8",
                      background: isActive ? "rgba(37, 99, 235, 0.22)" : "rgba(255, 255, 255, 0.03)",
                      border: isActive ? "1px solid rgba(59, 130, 246, 0.35)" : "1px solid rgba(255, 255, 255, 0.05)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span>{l.label}</span>
                    {isActive && (
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 8px #3b82f6" }} />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Direct Mobile Quick Actions */}
          <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "13px",
                borderRadius: "12px",
                fontSize: "0.92rem",
                fontWeight: 700,
                boxShadow: "0 8px 20px rgba(37, 99, 235, 0.40)",
              }}
            >
              Book 1-on-1 Consultation
            </Link>

            <div style={{ display: "flex", gap: "8px" }}>
              <a
                href={`tel:${settings.phone || "9053216093"}`}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "11px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.10)",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Call: +91 {settings.phone || "9053216093"}
              </a>

              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                style={{
                  padding: "11px 14px",
                  borderRadius: "10px",
                  background: "rgba(59, 130, 246, 0.12)",
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                  color: "#60a5fa",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Admin Desk
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-cta { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
