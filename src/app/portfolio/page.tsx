"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  TrendingUp, Shield, BarChart2, Globe, Clock, Tag,
  ChevronRight, X, ArrowUpRight, CheckCircle2, Zap
} from "lucide-react";
import { EDUCATIONAL_INSIGHTS, EXPERT_INFO } from "@/lib/data";
import { useSiteContent } from "@/lib/useSiteContent";
import PositionCalculator from "@/components/PositionCalculator";
import InquiryModal from "@/components/InquiryModal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ASSET_CLASSES = [
  {
    title: "Indian Equities & Indices",
    subtitle: "NIFTY 50 • BANK NIFTY • Bluechips",
    focus: "Intraday Price Action & Swing Structures",
    badge: "Equities",
    badgeColor: "var(--brand-primary)",
    badgeBg: "var(--brand-primary-light)",
    metrics: [
      { label: "Target R:R", value: "1:2.5+" },
      { label: "Execution Style", value: "Price Action" },
      { label: "Timeframe", value: "15M - 1D" },
    ],
    description: "Focus on institutional order flow, high-volume rejection zones, and option Greek volatility cycles on Nifty and Bank Nifty."
  },
  {
    title: "Global Forex Markets",
    subtitle: "EUR/USD • GBP/USD • USD/JPY",
    focus: "Session Overlap & Interbank Liquidity",
    badge: "Forex",
    badgeColor: "var(--brand-accent)",
    badgeBg: "rgba(14,165,233,0.1)",
    metrics: [
      { label: "Target R:R", value: "1:3.0+" },
      { label: "Session Focus", value: "London / NY" },
      { label: "Timeframe", value: "1H - 4H" },
    ],
    description: "Trading currency pairs by aligning macro economic calendars with strict session-opening liquidity expansion models."
  },
  {
    title: "Cryptocurrency Assets",
    subtitle: "Bitcoin (BTC) • Ethereum (ETH) • Solana",
    focus: "High-Timeframe Expansion & Market Cycles",
    badge: "Crypto",
    badgeColor: "#7c3aed",
    badgeBg: "rgba(124,58,237,0.1)",
    metrics: [
      { label: "Target R:R", value: "1:3.5+" },
      { label: "Execution Style", value: "Trend Following" },
      { label: "Market State", value: "24/7 Liquidity" },
    ],
    description: "Systematic multi-timeframe swing analysis across leading digital assets, prioritizing risk-adjusted position sizing."
  }
];

const CATEGORIES = ["All", "Index Analysis", "Options Strategies", "Swing Trading", "Trading Psychology"];

export default function PortfolioPage() {
  const { portfolio: livePortfolio } = useSiteContent();
  const portfolioList = livePortfolio && livePortfolio.length > 0 ? livePortfolio : EDUCATIONAL_INSIGHTS;
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeStudy, setActiveStudy] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredStudies = activeCategory === "All"
    ? portfolioList
    : portfolioList.filter((s) => s.category === activeCategory);

  useGSAP(() => {
    // Hero Entrance
    gsap.fromTo(".portfolio-hero > *",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.12, duration: 0.65, ease: "power3.out", delay: 0.1 }
    );

    // Asset cards
    ScrollTrigger.batch(".asset-card", {
      onEnter: (els) => gsap.fromTo(els,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power2.out" }
      ),
      start: "top 88%",
    });

    // Reveal elements
    gsap.utils.toArray<HTMLElement>(".scroll-reveal").forEach((el) => {
      gsap.fromTo(el, { y: 25, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.55, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      {/* ===== HERO SECTION ===== */}
      <section className="section" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 500, height: 400, background: "rgba(59,91,219,0.08)", borderRadius: "50%", filter: "blur(90px)", top: -80, right: -40 }} />
        <div style={{ position: "absolute", width: 400, height: 400, background: "rgba(124,58,237,0.06)", borderRadius: "50%", filter: "blur(80px)", bottom: -60, left: -40 }} />

        <div className="container">
          <div className="portfolio-hero" style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto" }}>
            <span className="section-label">Track Record & Case Studies</span>
            <h1 style={{ marginBottom: "16px", fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}>
              Trading{" "}
              <span className="gradient-text serif" style={{ fontStyle: "italic" }}>Portfolio</span> & Analytical Case Studies
            </h1>
            <p className="section-desc" style={{ margin: "0 auto 28px", fontSize: "1.02rem" }}>
              A disciplined, institutional approach to technical analysis. Review Kamal Verma&apos;s multi-market coverage, execution case studies, and quantitative risk parameters across Indian Equities, Global Forex, and Cryptocurrencies.
            </p>

            {/* Metric Highlights */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "32px" }}>
              {[
                { label: "Market Experience", value: "6+ Years" },
                { label: "Guided Traders", value: "1,000+" },
                { label: "Global Coverage", value: "3 Markets" },
                { label: "Max Risk Per Trade", value: "1.0% - 1.5%" },
              ].map((m) => (
                <div key={m.label} className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: "1.3rem", color: "var(--brand-primary)", letterSpacing: "-0.02em" }}>{m.value}</div>
                  <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 500, marginTop: "4px" }}>{m.label}</div>
                </div>
              ))}
            </div>

            <div className="disclaimer" style={{ fontSize: "0.76rem" }}>
              <Shield size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
              <strong>Purely Educational:</strong> All case studies, setups, and calculations presented below are for educational demonstration. No guaranteed profits or financial advisory services.
            </div>
          </div>
        </div>
      </section>

      {/* ===== ASSET CLASS COVERAGE ===== */}
      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="scroll-reveal" style={{ textAlign: "center", marginBottom: "40px" }}>
            <span className="section-label">Market Coverage</span>
            <h2 className="section-title">Where the Edge Is Applied</h2>
            <p className="section-desc" style={{ margin: "0 auto" }}>
              Different markets require specific volatility models. Here is how institutional structure is deployed across three major asset classes.
            </p>
          </div>

          <div className="grid-3">
            {ASSET_CLASSES.map((ac) => (
              <div key={ac.title} className="glass-card asset-card" style={{ padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <span className="badge" style={{ background: ac.badgeBg, color: ac.badgeColor, border: `1px solid ${ac.badgeBg}` }}>
                      {ac.badge}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>{ac.focus}</span>
                  </div>
                  <h3 style={{ fontSize: "1.15rem", marginBottom: "6px" }}>{ac.title}</h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "14px", fontWeight: 500 }}>{ac.subtitle}</p>
                  <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "20px" }}>
                    {ac.description}
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", borderTop: "1px solid var(--border-card)", paddingTop: "14px" }}>
                  {ac.metrics.map((m) => (
                    <div key={m.label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>{m.value}</div>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "2px" }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INTERACTIVE POSITION SIZING SUITE ===== */}
      <section className="section" style={{ background: "rgba(255,255,255,0.40)", borderTop: "1px solid var(--border-card)", borderBottom: "1px solid var(--border-card)" }}>
        <div className="container">
          <div className="scroll-reveal" style={{ textAlign: "center", marginBottom: "44px" }}>
            <span className="section-label">Risk Management Architecture</span>
            <h2 className="section-title">The Foundation of Portfolio Longevity</h2>
            <p className="section-desc" style={{ margin: "0 auto" }}>
              Amateurs focus on how much they can make; professionals focus on how much they can lose. Test Kamal Verma&apos;s mathematical position sizing formula below.
            </p>
          </div>

          <div style={{ maxWidth: "860px", margin: "0 auto" }}>
            <PositionCalculator />
          </div>
        </div>
      </section>

      {/* ===== ANALYTICAL CASE STUDIES ===== */}
      <section className="section">
        <div className="container">
          <div className="scroll-reveal" style={{ textAlign: "center", marginBottom: "40px" }}>
            <span className="section-label">Case Studies</span>
            <h2 className="section-title">Analytical Case Studies & Strategy Deconstructions</h2>
            <p className="section-desc" style={{ margin: "0 auto 24px" }}>
              Examine detailed technical breakdowns, market structure shifts, and volatility playbooks written by Kamal Verma.
            </p>

            {/* Filter Pills */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: "7px 18px", borderRadius: "var(--radius-full)",
                    border: "1px solid",
                    borderColor: activeCategory === cat ? "var(--brand-primary)" : "var(--border-card)",
                    background: activeCategory === cat ? "var(--brand-primary)" : "var(--bg-glass-strong)",
                    color: activeCategory === cat ? "#fff" : "var(--text-secondary)",
                    fontWeight: 600, fontSize: "0.80rem", cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-2">
            {filteredStudies.length === 0 ? (
              <div className="glass-card" style={{ padding: "48px 24px", textAlign: "center", gridColumn: "1 / -1" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                  No case studies currently found in this category.
                </p>
              </div>
            ) : (
              filteredStudies.map((study) => (
                <div
                  key={study.id || study.slug}
                  className="glass-card"
                  style={{ padding: "28px", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                  onClick={() => setActiveStudy(study)}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span className="badge badge-blue">{study.category}</span>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={11} /> {study.readTime}
                      </span>
                    </div>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "10px", lineHeight: 1.4 }}>{study.title}</h3>
                    <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: 1.68, marginBottom: "18px" }}>
                      {study.summary}
                    </p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-card)", paddingTop: "14px" }}>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {(study.tags || []).slice(0, 2).map((t: string) => (
                        <span key={t} style={{
                          fontSize: "0.70rem", fontWeight: 600, color: "var(--text-muted)",
                          background: "rgba(148,163,184,0.12)", padding: "2px 8px",
                          borderRadius: "var(--radius-full)"
                        }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span style={{ fontSize: "0.80rem", fontWeight: 700, color: "var(--brand-primary)", display: "flex", alignItems: "center", gap: "3px" }}>
                      Read Case Study <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ===== STUDY READER MODAL ===== */}
      {activeStudy && (
        <div className="modal-overlay" onClick={() => setActiveStudy(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <span className="badge badge-blue" style={{ marginBottom: "8px" }}>{activeStudy.category}</span>
                <h3 style={{ fontSize: "1.2rem", lineHeight: 1.35 }}>{activeStudy.title}</h3>
              </div>
              <button onClick={() => setActiveStudy(null)} style={{
                background: "var(--brand-primary-light)", border: "none", cursor: "pointer",
                borderRadius: "8px", padding: "6px", color: "var(--brand-primary)", flexShrink: 0, marginLeft: "12px"
              }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", gap: "12px", marginBottom: "16px", fontSize: "0.76rem", color: "var(--text-muted)" }}>
              <span>By Kamal Verma</span>
              <span>•</span>
              <span>{activeStudy.readTime}</span>
              <span>•</span>
              <span>{activeStudy.date}</span>
            </div>

            <div style={{ background: "rgba(59,91,219,0.06)", borderLeft: "3px solid var(--brand-primary)", padding: "12px 16px", borderRadius: "0 8px 8px 0", marginBottom: "20px" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--brand-primary)", textTransform: "uppercase", marginBottom: "4px" }}>
                Case Study Executive Takeaway
              </div>
              <p style={{ fontSize: "0.88rem", color: "var(--text-primary)", margin: 0, lineHeight: 1.6 }}>
                {activeStudy.summary}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "320px", overflowY: "auto", paddingRight: "6px" }}>
              {(activeStudy.content || []).map((para: string, i: number) => (
                <p key={i} style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.75, margin: 0 }}>
                  {para}
                </p>
              ))}
            </div>

            <div className="disclaimer" style={{ marginTop: "20px", fontSize: "0.74rem" }}>
              📚 Case study analysis is for educational and illustrative purposes only.
            </div>
          </div>
        </div>
      )}

      {/* ===== CTA BANNER ===== */}
      <section className="section-sm">
        <div className="container">
          <div className="scroll-reveal" style={{
            background: "linear-gradient(135deg, #3b5bdb 0%, #7c3aed 100%)",
            borderRadius: "var(--radius-xl)", padding: "48px 40px",
            textAlign: "center", position: "relative", overflow: "hidden",
            boxShadow: "0 20px 60px rgba(59,91,219,0.28)"
          }}>
            <h2 style={{ color: "#fff", marginBottom: "12px", fontSize: "clamp(1.6rem,3vw,2.2rem)" }}>
              Discuss Your Trading Methodology with Kamal Verma
            </h2>
            <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "26px", fontSize: "0.96rem", maxWidth: "480px", margin: "0 auto 26px" }}>
              Whether you trade Indian equities, foreign exchange, or crypto, schedule a free discovery consultation to audit your current approach.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  background: "#fff", color: "var(--brand-primary)",
                  fontWeight: 700, fontSize: "0.90rem", padding: "12px 28px",
                  border: "none", borderRadius: "var(--radius-full)", cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)"
                }}
              >
                Schedule Consultation
              </button>
              <Link
                href="/services"
                style={{
                  color: "#fff", fontWeight: 600, fontSize: "0.90rem", padding: "12px 28px",
                  border: "1px solid rgba(255,255,255,0.35)", borderRadius: "var(--radius-full)",
                  textDecoration: "none"
                }}
              >
                View Educational Programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      <InquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        programTitle="Portfolio & Methodology Consultation"
      />
    </div>
  );
}
