"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CheckCircle2, ChevronRight, Shield } from "lucide-react";
import InquiryModal from "@/components/InquiryModal";
import { SERVICES_LIST } from "@/lib/data";
import { useSiteContent } from "@/lib/useSiteContent";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CARD_COLORS = [
  { accent: "var(--brand-primary)", bg: "var(--brand-primary-light)" },
  { accent: "#7c3aed", bg: "rgba(124,58,237,0.09)" },
  { accent: "var(--brand-accent)", bg: "rgba(14,165,233,0.09)" },
  { accent: "var(--brand-green)", bg: "var(--brand-green-light)" },
];

export default function ServicesPage() {
  const { services: liveServices } = useSiteContent();
  const servicesList = liveServices && liveServices.length > 0 ? liveServices : SERVICES_LIST;
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleInquire = (title: string) => {
    setSelectedService(title);
    setIsModalOpen(true);
  };

  useGSAP(() => {
    // Hero
    gsap.fromTo(".services-hero > *",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.12, duration: 0.6, ease: "power3.out", delay: 0.1 }
    );

    // Service cards
    ScrollTrigger.batch(".svc-card", {
      onEnter: (els) => gsap.fromTo(els,
        { y: 50, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, stagger: 0.12, duration: 0.65, ease: "power3.out" }
      ),
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
        <div style={{ position: "absolute", width: 500, height: 300, background: "rgba(124,58,237,0.07)", borderRadius: "50%", filter: "blur(80px)", top: -60, left: "20%" }} />
        <div className="container">
          <div className="services-hero" style={{ textAlign: "center", maxWidth: "660px", margin: "0 auto" }}>
            <span className="section-label">Programs</span>
            <h1 style={{ marginBottom: "16px" }}>
              Educational{" "}
              <span className="gradient-text serif" style={{ fontStyle: "italic" }}>Programs</span>
            </h1>
            <p className="section-desc" style={{ margin: "0 auto 24px" }}>
              Structured learning resources and educational guidance across stock market, forex, and cryptocurrency. Built for analytical thinking and disciplined risk awareness.
            </p>
            <div className="disclaimer">
              <Shield size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "5px" }} />
              All programs are <strong>purely educational</strong>. Not SEBI-registered investment advice. Trading involves substantial risk.
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICE CARDS ===== */}
      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {servicesList.length === 0 ? (
              <div className="glass-card" style={{ padding: "48px 24px", textAlign: "center" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                  No educational programs are currently published. Please check back soon or get in touch directly.
                </p>
              </div>
            ) : (
              servicesList.map((s, i) => {
                const clr = CARD_COLORS[i % CARD_COLORS.length];
                return (
                  <div key={s.id || s.title} className="glass-card svc-card" style={{ padding: "32px 30px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
                          <span className="badge" style={{ background: clr.bg, color: clr.accent, border: `1px solid ${clr.bg}` }}>
                            {s.subtitle || "Program"}
                          </span>
                          {s.scope && (
                            <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 500 }}>
                              {s.scope}
                            </span>
                          )}
                        </div>
                        <h2 style={{ fontSize: "1.35rem", marginBottom: "10px" }}>{s.title}</h2>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.72, marginBottom: "20px", maxWidth: "580px" }}>
                          {s.description}
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" }}>
                          {(s.features || []).map((f: string) => (
                            <div key={f} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                              <CheckCircle2 size={15} color={clr.accent} style={{ marginTop: "2px", flexShrink: 0 }} />
                              <span style={{ fontSize: "0.83rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        id={`inquire-${s.id}`}
                        onClick={() => handleInquire(s.title)}
                        className="btn-primary"
                        style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                      >
                        Inquire <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ===== DISCLAIMER ===== */}
      <section className="section-sm">
        <div className="container">
          <div className="scroll-reveal disclaimer" style={{ maxWidth: "720px", margin: "0 auto" }}>
            <strong>Important Notice:</strong> Kamal Verma is an independent trading educator and is not registered with SEBI, FINRA, or any financial regulatory authority. The educational programs offered do not constitute investment advisory services. Past educational exposure does not guarantee future trading profitability. All financial decisions are the sole responsibility of the individual.
          </div>
        </div>
      </section>

      <InquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        programTitle={selectedService || "General Inquiry"}
      />
    </div>
  );
}
