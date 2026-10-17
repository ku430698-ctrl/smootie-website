"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Shield, TrendingUp, BookOpen, Users, Target, Zap } from "lucide-react";
import { EXPERT_INFO } from "@/lib/data";
import { useSiteContent } from "@/lib/useSiteContent";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const VALUES = [
  { icon: <BookOpen size={18} />, title: "Financial Education", color: "var(--brand-primary)", bg: "var(--brand-primary-light)" },
  { icon: <Shield size={18} />, title: "Transparency", color: "var(--brand-green)", bg: "var(--brand-green-light)" },
  { icon: <TrendingUp size={18} />, title: "Analytical Thinking", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
  { icon: <Target size={18} />, title: "Risk Awareness", color: "var(--brand-accent)", bg: "rgba(14,165,233,0.1)" },
  { icon: <Zap size={18} />, title: "Continuous Learning", color: "#f59e0b", bg: "#fef3c7" },
  { icon: <Users size={18} />, title: "Realistic Expectations", color: "var(--brand-rose)", bg: "rgba(244,63,94,0.08)" },
];

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { about, settings } = useSiteContent();

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.1 });
    tl.fromTo(".about-hero-text > *",
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.12, duration: 0.6, ease: "power3.out" }
    );
    tl.fromTo(".about-profile-card",
      { x: 50, opacity: 0, scale: 0.97 },
      { x: 0, opacity: 1, scale: 1, duration: 0.75, ease: "power3.out" },
      "-=0.45"
    );

    ScrollTrigger.batch(".value-card", {
      onEnter: (els) => gsap.fromTo(els, { y: 36, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.55, ease: "power2.out" }),
      start: "top 88%",
    });

    gsap.utils.toArray<HTMLElement>(".scroll-reveal").forEach((el) => {
      gsap.fromTo(el, { y: 28, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 86%", once: true }
      });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      {/* ===== HERO ===== */}
      <section className="section" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 400, height: 400, background: "rgba(59,91,219,0.08)", borderRadius: "50%", filter: "blur(80px)", top: -80, right: -80 }} />

        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", gap: "60px" }}>
            <div className="about-hero-text">
              <span className="section-label">About</span>
              <h1 style={{ marginBottom: "18px" }}>
                {about.heading || "About Kamal Verma"}
              </h1>
              <div className="divider" />
              <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", lineHeight: 1.8, marginTop: "18px", marginBottom: "22px" }}>
                {about.bioIntro || EXPERT_INFO.bioIntro}
              </p>
              <Link href="/contact" className="btn-primary">
                Connect with Me
              </Link>
            </div>

            {/* Profile Card with Large Executive Portrait */}
            <div className="about-profile-card glass-card" style={{
              padding: "24px",
              borderRadius: "28px",
              background: "rgba(10, 14, 24, 0.78)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.55)",
              overflow: "hidden"
            }}>
              {/* Executive Portrait Container with Blue Glow */}
              <div style={{
                position: "relative",
                width: "100%",
                height: "380px",
                borderRadius: "20px",
                overflow: "hidden",
                background: "radial-gradient(circle at 50% 40%, rgba(37, 99, 235, 0.35) 0%, rgba(10, 14, 24, 0.95) 75%)",
                marginBottom: "20px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}>
                <Image
                  src="/images/kamal-verma-suit.jpg"
                  alt="Kamal Verma — Trading Mentor and Financial Markets Educator"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 440px"
                  style={{ objectFit: "contain", objectPosition: "bottom center" }}
                />
              </div>

              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#ffffff", marginBottom: "4px" }}>
                  {settings.websiteName || EXPERT_INFO.name}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--brand-primary)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {about.subheading || "Trading Mentor & Market Analyst"}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                {[
                  { label: "Years Experience", value: `${about.experienceYears || "6"}+` },
                  { label: "Traders Guided", value: about.studentsCount || "1,000+" },
                  { label: "Asset Classes", value: "3 Markets" },
                  { label: "Mentorship Focus", value: "Price Action" },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: "rgba(37, 99, 235, 0.08)",
                    border: "1px solid rgba(37, 99, 235, 0.18)",
                    borderRadius: "14px",
                    padding: "14px 10px",
                    textAlign: "center"
                  }}>
                    <div style={{ fontWeight: 800, fontSize: "1.15rem", color: "#3b82f6", letterSpacing: "-0.02em" }}>{s.value}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500, marginTop: "3px" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="disclaimer" style={{ fontSize: "0.74rem" }}>
                📚 All content shared is for educational purposes only. Not SEBI registered investment advice.
              </div>
            </div>
          </div>
        </div>
        <style>{`@media(max-width:768px){ section > .container > div { grid-template-columns:1fr !important; } }`}</style>
      </section>

      {/* ===== MISSION & VISION ===== */}
      <section className="section-sm" style={{ background: "rgba(10, 14, 24, 0.45)", borderTop: "1px solid var(--border-card)", borderBottom: "1px solid var(--border-card)" }}>
        <div className="container">
          <div className="grid-2">
            {[
              { label: "Mission", text: about.mission || EXPERT_INFO.mission, color: "var(--brand-primary)", bg: "var(--brand-primary-light)" },
              { label: "Vision", text: about.vision || EXPERT_INFO.vision, color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
            ].map((mv) => (
              <div key={mv.label} className="glass-card scroll-reveal" style={{ padding: "28px 26px" }}>
                <span className="badge" style={{ background: mv.bg, color: mv.color, border: `1px solid ${mv.bg}`, marginBottom: "14px" }}>
                  {mv.label}
                </span>
                <p style={{ fontSize: "0.93rem", color: "var(--text-secondary)", lineHeight: 1.75 }}>{mv.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CORE VALUES ===== */}
      <section className="section">
        <div className="container">
          <div className="scroll-reveal" style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="section-label">Core Values</span>
            <h2 className="section-title">What I Stand For</h2>
          </div>
          <div className="grid-3">
            {VALUES.map((v, i) => (
              <div key={v.title} className="glass-card value-card" style={{ padding: "22px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: 42, height: 42, minWidth: 42, borderRadius: "11px", background: v.bg, color: v.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {v.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: "3px" }}>{v.title}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{EXPERT_INFO.coreValues[i]?.desc?.slice(0, 70)}...</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DISCLAIMER ===== */}
      <section className="section-sm">
        <div className="container">
          <div className="disclaimer scroll-reveal" style={{ maxWidth: "720px", margin: "0 auto" }}>
            <strong>Educational Disclaimer:</strong> All content, analysis, and guidance provided by Kamal Verma is strictly for educational purposes. This is not investment advice. Trading and investing in financial markets involves substantial risk of loss. Consult a SEBI-registered financial advisor before making any investment decisions.
          </div>
        </div>
      </section>
    </div>
  );
}
