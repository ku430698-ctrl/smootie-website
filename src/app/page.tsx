"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  ArrowRight, Users, Shield, BookOpen,
  BarChart2, Globe, ChevronRight, Star,
  Award, Sparkles, Phone
} from "lucide-react";
import InquiryModal from "@/components/InquiryModal";
import HeroBackgroundCanvas from "@/components/HeroBackgroundCanvas";
import { EXPERT_INFO, EDUCATIONAL_PILLARS, SERVICES_LIST } from "@/lib/data";
import { useSiteContent } from "@/lib/useSiteContent";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function HomePage() {
  const { home, settings, services } = useSiteContent();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const displayServices = services && services.length > 0 ? services : SERVICES_LIST;

  useGSAP(() => {
    // 1. Hero Section Entrance Animation Timeline
    const tl = gsap.timeline({ delay: 0.1 });
    tl.fromTo(".hero-h1", { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" })
      .fromTo(".hero-badge", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.35")
      .fromTo(".hero-sub", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.3")
      .fromTo(".hero-ctas", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.25")
      .fromTo(".hero-portrait-wrap", { scale: 0.94, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.5")
      .fromTo(".hero-bottom-bar", { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power2.out" }, "-=0.3");

    // 2. Cursor Parallax & Spotlight Follower on Hero
    const heroEl = heroRef.current;
    if (heroEl) {
      const textXTo = gsap.quickTo(".hero-text-col", "x", { duration: 0.7, ease: "power2.out" });
      const textYTo = gsap.quickTo(".hero-text-col", "y", { duration: 0.7, ease: "power2.out" });
      const spotXTo = gsap.quickTo(spotlightRef.current, "x", { duration: 0.35, ease: "power2.out" });
      const spotYTo = gsap.quickTo(spotlightRef.current, "y", { duration: 0.35, ease: "power2.out" });

      const handleHeroMouseMove = (e: MouseEvent) => {
        const rect = heroEl.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const relX = mouseX - rect.width / 2;
        const relY = mouseY - rect.height / 2;

        textXTo(relX * 0.015);
        textYTo(relY * 0.015);

        spotXTo(mouseX - 200);
        spotYTo(mouseY - 200);
      };

      heroEl.addEventListener("mousemove", handleHeroMouseMove);
      return () => {
        heroEl.removeEventListener("mousemove", handleHeroMouseMove);
      };
    }

    // 3. Scroll Batch Animations for Pillars & Services
    ScrollTrigger.batch(".pillar-card", {
      onEnter: (els) => gsap.fromTo(els, { y: 36, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power2.out" }),
      start: "top 86%",
    });

    ScrollTrigger.batch(".service-card", {
      onEnter: (els) => gsap.fromTo(els, { y: 44, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, stagger: 0.12, duration: 0.65, ease: "power3.out" }),
      start: "top 88%",
    });

    // 4. Section headings reveal
    gsap.utils.toArray<HTMLElement>(".scroll-reveal").forEach((el) => {
      gsap.fromTo(el,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true }
        }
      );
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      {/* ========== HERO SECTION (FLORIAN WEBER REFERENCE ARCHITECTURE) ========== */}
      <section
        ref={heroRef}
        style={{
          padding: "48px 0 64px",
          position: "relative",
          overflow: "hidden",
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Subtle Ambient Mesh & Candlestick Canvas in Background */}
        <HeroBackgroundCanvas />

        {/* Dynamic Cursor Spotlight Following Mouse */}
        <div
          ref={spotlightRef}
          className="cursor-spotlight"
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 1,
            top: 0,
            left: 0,
            filter: "blur(32px)",
            willChange: "transform",
          }}
        />

        {/* Hero Stage Card */}
        <div className="container" style={{ position: "relative", zIndex: 3 }}>
          <div
            className="hero-main-card"
            style={{
              background: "rgba(10, 14, 24, 0.78)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "28px",
              padding: "clamp(28px, 3.5vw, 44px)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
            }}
          >
            {/* Upper Stage: Left Info + Right Authentic Portrait */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 0.9fr",
                alignItems: "start",
                gap: "clamp(24px, 3vw, 44px)",
              }}
              className="hero-grid"
            >
              {/* Left Column: Headline, Bio & Interactive CTAs */}
              <div className="hero-text-col" style={{ willChange: "transform" }}>
                <h1
                  className="hero-h1"
                  style={{
                    fontSize: "clamp(2.1rem, 3.2vw, 3.25rem)",
                    fontWeight: 800,
                    lineHeight: 1.15,
                    letterSpacing: "-0.028em",
                    marginBottom: "12px",
                    color: "#ffffff",
                  }}
                >
                  {home.heroTitle || "Kamal Verma"}
                </h1>

                <div
                  className="hero-badge"
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--brand-primary)",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Sparkles size={16} />
                  <span>{home.heroBadge || "TRADING MENTOR & MARKET ANALYST"}</span>
                </div>

                <p
                  className="hero-sub"
                  style={{
                    fontSize: "1rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.68,
                    marginBottom: "26px",
                    maxWidth: "520px",
                  }}
                >
                  {home.heroSubtitle || (
                    <>
                      Developing disciplined, institutional market clarity across <strong>Indian Equities</strong>, <strong>Global Forex</strong>, and <strong>Cryptocurrency</strong>. Structured analytical frameworks. Strict capital preservation. Measurable consistency.
                    </>
                  )}
                </p>

                {/* Action Buttons matching reference style */}
                <div
                  className="hero-ctas"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    flexWrap: "wrap",
                    marginBottom: "26px",
                  }}
                >
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                    style={{
                      background: "#2563eb",
                      color: "#ffffff",
                      padding: "13px 28px",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      borderRadius: "12px",
                      boxShadow: "0 8px 24px rgba(37, 99, 235, 0.40)",
                    }}
                  >
                    {home.heroPrimaryCtaText || "Book Consultation"} <ArrowRight size={16} />
                  </button>

                  <Link
                    href="/services"
                    className="btn-ghost"
                    style={{
                      padding: "13px 26px",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      borderRadius: "12px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.14)",
                      color: "#f8fafc",
                    }}
                  >
                    {home.heroSecondaryCtaText || "Explore Programs"}
                  </Link>

                  <a
                    href={`tel:${settings.phone || EXPERT_INFO.phone}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      color: "var(--text-secondary)",
                      fontSize: "0.86rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      padding: "11px 16px",
                      borderRadius: "12px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Phone size={14} color="var(--brand-primary)" /> +91 {settings.phone || EXPERT_INFO.phone}
                  </a>
                </div>

                {/* Key Experience Stats */}
                <div
                  className="hero-stats-row"
                  style={{
                    display: "flex",
                    gap: "24px",
                    flexWrap: "wrap",
                    paddingTop: "18px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {[
                    { n: "6+", label: "Years Experience" },
                    { n: "1,000+", label: "Guided Traders" },
                    { n: "3", label: "Global Asset Classes" },
                    { n: "100%", label: "Pure Education" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1 }}>
                        {s.n}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Authentic Kamal Verma Portrait with Blue Radial Spotlight */}
              <div
                className="hero-portrait-wrap"
                style={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  alignSelf: "flex-start",
                  width: "100%",
                  marginTop: "6px",
                }}
              >
                {/* Soft Radial Ambient Blue Spotlight centered behind Kamal Verma */}
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    maxWidth: "420px",
                    height: "100%",
                    maxHeight: "420px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(37, 99, 235, 0.45) 0%, rgba(30, 58, 138, 0.20) 45%, transparent 70%)",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    filter: "blur(32px)",
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                />

                {/* Kamal Verma 100% Original Face & Trading Desk Setup */}
                <div
                  className="hero-image-box"
                  style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "520px",
                    aspectRatio: "4 / 3",
                    zIndex: 2,
                    borderRadius: "22px",
                    overflow: "hidden",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    boxShadow: "0 24px 60px rgba(0, 0, 0, 0.65), 0 0 40px rgba(37, 99, 235, 0.25)",
                  }}
                >
                  <Image
                    src="/images/kamal-verma-hero.jpg"
                    alt="Kamal Verma — Professional Trading Mentor & Market Analyst"
                    fill
                    priority
                    sizes="(max-width: 900px) 100vw, 520px"
                    style={{
                      objectFit: "cover",
                      objectPosition: "center 25%",
                    }}
                  />
                  {/* Floating Desk Status Pill */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "16px",
                      left: "16px",
                      background: "rgba(10, 14, 24, 0.85)",
                      backdropFilter: "blur(14px)",
                      WebkitBackdropFilter: "blur(14px)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      padding: "8px 14px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
                    <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#ffffff", letterSpacing: "0.02em" }}>
                      Institutional Multi-Screen Trading Desk
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 3-Pillar Horizontal Container (Matching Reference Architecture) */}
            <div
              className="hero-bottom-bar"
              style={{
                marginTop: "36px",
                paddingTop: "24px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "24px",
              }}
            >
              {/* Feature 1 */}
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "10px",
                    background: "rgba(37, 99, 235, 0.15)",
                    border: "1px solid rgba(37, 99, 235, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#3b82f6",
                    flexShrink: 0,
                  }}
                >
                  <BarChart2 size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: "0.98rem", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>
                    Technical Analysis
                  </h4>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    Institutional market structure, liquidity zones & order-flow price action.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "10px",
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#10b981",
                    flexShrink: 0,
                  }}
                >
                  <Shield size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: "0.98rem", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>
                    Risk Management
                  </h4>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    Strict capital preservation, asymmetric risk-to-reward & position sizing rules.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "10px",
                    background: "rgba(139, 92, 246, 0.15)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a855f7",
                    flexShrink: 0,
                  }}
                >
                  <Award size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: "0.98rem", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>
                    Trading Psychology
                  </h4>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    Emotional neutrality, disciplined rule execution & long-term consistency.
                  </p>
                </div>
              </div>
            </div>

            {/* Specialties Footer Strip */}
            <div
              style={{
                marginTop: "24px",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              <span style={{ color: "var(--brand-primary)" }}>Specialties:</span> Indian Equities (NSE/BSE) • Global Forex • Cryptocurrency • Derivatives
            </div>
          </div>
        </div>

        {/* Responsive CSS helper */}
        <style>{`
          @media (max-width: 960px) {
            .hero-main-card {
              padding: 28px 20px 24px !important;
              border-radius: 20px !important;
            }
            .hero-grid {
              grid-template-columns: 1fr !important;
              gap: 32px !important;
            }
            .hero-text-col {
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .hero-h1 {
              font-size: clamp(1.85rem, 6.2vw, 2.4rem) !important;
              line-height: 1.18 !important;
            }
            .hero-badge {
              justify-content: center;
            }
            .hero-sub {
              margin-left: auto;
              margin-right: auto;
            }
            .hero-ctas {
              justify-content: center;
            }
            .hero-stats-row {
              justify-content: center;
              gap: 20px !important;
            }
            .hero-portrait-wrap {
              width: 100% !important;
              margin-top: 0 !important;
              align-self: center !important;
            }
            .hero-image-box {
              max-width: 100% !important;
              aspect-ratio: 4 / 3 !important;
              height: auto !important;
            }
            .hero-bottom-bar {
              margin-top: 28px !important;
              padding-top: 20px !important;
              grid-template-columns: 1fr !important;
              gap: 16px !important;
            }
          }
        `}</style>
      </section>

      {/* ========== EDUCATIONAL PILLARS ========== */}
      <section className="section" style={{ background: "rgba(10, 14, 24, 0.45)", backdropFilter: "blur(12px)", borderTop: "1px solid var(--border-card)", borderBottom: "1px solid var(--border-card)" }}>
        <div className="container">
          <div className="scroll-reveal" style={{ textAlign: "center", marginBottom: "52px" }}>
            <span className="section-label">Core Curriculum</span>
            <h2 className="section-title">{home.pillarsTitle || "Four Pillars of Market Mastery"}</h2>
            <p className="section-desc" style={{ margin: "0 auto" }}>
              {home.pillarsDesc || "A structured education built around institutional analytical clarity, risk discipline, and consistent market understanding."}
            </p>
          </div>

          <div className="grid-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {EDUCATIONAL_PILLARS.map((p, i) => {
              const icons = [<BarChart2 key={0} size={22} />, <Globe key={1} size={22} />, <Shield key={2} size={22} />, <BookOpen key={3} size={22} />];
              const colors = ["var(--brand-primary)", "var(--brand-accent)", "var(--brand-green)", "#7c3aed"];
              const bgs = ["var(--brand-primary-light)", "rgba(14,165,233,0.1)", "var(--brand-green-light)", "rgba(124,58,237,0.1)"];
              return (
                <div key={p.title} className="glass-card pillar-card" style={{ padding: "26px 22px" }}>
                  <div style={{ width: 44, height: 44, background: bgs[i], borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: colors[i], marginBottom: "16px" }}>
                    {icons[i]}
                  </div>
                  <h3 style={{ fontSize: "1rem", marginBottom: "8px" }}>{p.title}</h3>
                  <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.65 }}>{p.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== SERVICES PREVIEW ========== */}
      <section className="section">
        <div className="container">
          <div className="scroll-reveal" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span className="section-label">Mentorship</span>
              <h2 className="section-title" style={{ marginBottom: 0 }}>{home.specialtiesTitle || "Structured Learning Programs"}</h2>
            </div>
            <Link href="/services" className="btn-ghost" style={{ padding: "10px 22px", fontSize: "0.85rem" }}>
              View All Programs <ChevronRight size={15} />
            </Link>
          </div>

          <div className="grid-2">
            {displayServices.slice(0, 4).map((s, i) => (
              <div key={s.title} className="glass-card service-card" style={{ padding: "28px 26px", cursor: "pointer" }}
                onClick={() => setIsModalOpen(true)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <span className={i % 2 === 0 ? "badge badge-blue" : "badge badge-green"}>{s.subtitle}</span>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </div>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "10px" }}>{s.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "16px" }}>
                  {s.description}
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {(s.features || []).slice(0, 2).map((h: string) => (
                    <span key={h} style={{
                      fontSize: "0.74rem", fontWeight: 600, color: "var(--text-secondary)",
                      background: "rgba(148,163,184,0.12)", padding: "4px 10px",
                      borderRadius: "var(--radius-full)", border: "1px solid var(--border-card)"
                    }}>{h}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA BANNER ========== */}
      <section className="section-sm">
        <div className="container">
          <div className="scroll-reveal" style={{
            background: "linear-gradient(135deg, #3b5bdb 0%, #7c3aed 100%)",
            borderRadius: "var(--radius-xl)", padding: "52px 48px",
            textAlign: "center", position: "relative", overflow: "hidden",
            boxShadow: "0 20px 60px rgba(59,91,219,0.30)"
          }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.08), transparent 60%)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", display: "block", marginBottom: "12px" }}>
                Begin Your Journey
              </span>
              <h2 style={{ color: "#fff", marginBottom: "14px", fontSize: "clamp(1.6rem,3vw,2.4rem)" }}>
                Ready to Read the Markets Objectively?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.78)", marginBottom: "28px", fontSize: "1rem", maxWidth: "460px", margin: "0 auto 28px" }}>
                Schedule a 1-on-1 discovery consultation with Kamal Verma to discuss your trading goals and structured educational path.
              </p>
              <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => setIsModalOpen(true)} style={{
                  background: "#fff", color: "var(--brand-primary)",
                  fontWeight: 700, fontSize: "0.92rem", padding: "13px 30px",
                  border: "none", borderRadius: "var(--radius-full)", cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.12)", transition: "all 0.2s"
                }}>
                  Book Free Consultation
                </button>
                <Link href="/services" style={{
                  color: "#fff", fontWeight: 600, fontSize: "0.92rem", padding: "13px 30px",
                  border: "1px solid rgba(255,255,255,0.35)", borderRadius: "var(--radius-full)",
                  textDecoration: "none", transition: "all 0.2s"
                }}>
                  Explore Programs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <InquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        programTitle="General Inquiry"
      />
    </div>
  );
}
