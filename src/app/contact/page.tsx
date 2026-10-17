"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Phone, Mail, MessageSquare, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { EXPERT_INFO, BRAND_FAQS } from "@/lib/data";
import { useSiteContent } from "@/lib/useSiteContent";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MARKETS = ["Stock Market", "Forex", "Cryptocurrency", "All Three Markets", "Not Sure Yet"];
const EXPERIENCE = ["Complete Beginner", "Some Knowledge", "Intermediate", "Advanced"];

export default function ContactPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { contact, settings } = useSiteContent();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", market: "", experience: "", message: "" });

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.1 });
    tl.fromTo(".contact-hero > *",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.12, duration: 0.6, ease: "power3.out" }
    );
    tl.fromTo(".contact-card",
      { x: 40, opacity: 0, scale: 0.97 },
      { x: 0, opacity: 1, scale: 1, duration: 0.65, ease: "power3.out" },
      "-=0.4"
    );

    ScrollTrigger.batch(".faq-item", {
      onEnter: (els) => gsap.fromTo(els,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: "power2.out" }
      ),
      start: "top 88%",
    });
  }, { scope: containerRef });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, programInterest: form.market, type: "contact" }),
      });
      setSubmitted(true);
    } catch {
      // still show success UX
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef}>
      {/* ===== HERO ===== */}
      <section className="section" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 380, height: 380, background: "rgba(16,185,129,0.08)", borderRadius: "50%", filter: "blur(80px)", bottom: -60, right: -60 }} />

        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "start" }}>
            {/* Left: Info */}
            <div>
              <div className="contact-hero">
                <span className="section-label">Get in Touch</span>
                <h1 style={{ marginBottom: "16px" }}>
                  {contact.heading || "Book a Free Call"}
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "1.02rem", lineHeight: 1.75, marginBottom: "32px" }}>
                  {contact.subheading || "Ready to start your trading education journey? Reach out directly or fill the form — Kamal will personally respond."}
                </p>

                {/* Contact methods */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "32px" }}>
                  {[
                    {
                      icon: <Phone size={18} color="var(--brand-primary)" />,
                      label: "Phone & WhatsApp",
                      value: `+91 ${contact.phone || settings.phone || EXPERT_INFO.phone}`,
                      href: `tel:${contact.phone || settings.phone || EXPERT_INFO.phone}`,
                      bg: "var(--brand-primary-light)",
                    },
                    {
                      icon: <MessageSquare size={18} color="var(--brand-green)" />,
                      label: "WhatsApp Direct",
                      value: `+91 ${settings.whatsapp || contact.phone || EXPERT_INFO.phone}`,
                      href: `https://wa.me/91${(settings.whatsapp || contact.phone || EXPERT_INFO.phone).replace(/\D/g, "")}`,
                      bg: "var(--brand-green-light)",
                    },
                    {
                      icon: <Mail size={18} color="#7c3aed" />,
                      label: "Email Inquiry",
                      value: contact.email || settings.email || "inquiry@kamalverma.in",
                      href: `mailto:${contact.email || settings.email || "inquiry@kamalverma.in"}`,
                      bg: "rgba(124,58,237,0.09)",
                    },
                  ].map((c) => (
                    <a key={c.label} href={c.href}
                      style={{
                        display: "flex", alignItems: "center", gap: "14px",
                        background: "var(--bg-card)", backdropFilter: "var(--blur-glass)",
                        border: "1px solid var(--border-glass)", borderRadius: "var(--radius-md)",
                        padding: "14px 18px", textDecoration: "none", transition: "all 0.22s",
                        boxShadow: "var(--shadow-card)"
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card-hover)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)"; }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: "10px", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{c.icon}</div>
                      <div>
                        <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: 500, marginBottom: "2px" }}>{c.label}</div>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--text-primary)" }}>{c.value}</div>
                      </div>
                    </a>
                  ))}
                </div>

                <div className="disclaimer" style={{ fontSize: "0.76rem" }}>
                  {contact.disclaimerText ? (
                    <span>📚 {contact.disclaimerText}</span>
                  ) : (
                    <span>📚 All interactions are for <strong>educational inquiry only</strong>. No investment advice or portfolio management is provided.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="contact-card glass-card" id="contact-form" style={{ padding: "32px" }}>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ width: 64, height: 64, background: "var(--brand-green-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <CheckCircle2 size={30} color="var(--brand-green)" />
                  </div>
                  <h3 style={{ marginBottom: "10px" }}>Inquiry Received!</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.90rem" }}>
                    Kamal Verma will review your message and reach out personally within 24 hours via WhatsApp or phone.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <h3 style={{ marginBottom: "4px" }}>Send an Inquiry</h3>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>All fields marked * are required.</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input id="contact-name" className="form-input" required placeholder="Your full name"
                      value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input id="contact-email" className="form-input" type="email" required placeholder="your@email.com"
                        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone *</label>
                      <input id="contact-phone" className="form-input" type="tel" required placeholder="+91 XXXXX XXXXX"
                        value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Market Interest</label>
                    <select id="contact-market" className="form-select"
                      value={form.market} onChange={(e) => setForm({ ...form, market: e.target.value })}>
                      <option value="">Select market...</option>
                      {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Experience Level</label>
                    <select id="contact-experience" className="form-select"
                      value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })}>
                      <option value="">Select level...</option>
                      {EXPERIENCE.map((x) => <option key={x} value={x}>{x}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea id="contact-message" className="form-textarea" placeholder="Tell me about your goals..."
                      value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  </div>

                  <button id="contact-submit" type="submit" className="btn-primary"
                    disabled={loading}
                    style={{ justifyContent: "center", opacity: loading ? 0.7 : 1 }}>
                    {loading ? "Sending..." : "Send Inquiry"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <style>{`@media(max-width:768px){ section > .container > div { grid-template-columns:1fr !important; } }`}</style>
      </section>

      {/* ===== FAQ ===== */}
      <section className="section" style={{ background: "rgba(255,255,255,0.35)", borderTop: "1px solid var(--border-card)" }}>
        <div className="container" style={{ maxWidth: "720px" }}>
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <span className="section-label">FAQ</span>
            <h2>Frequently Asked Questions</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {BRAND_FAQS.map((faq, i) => (
              <div key={i} className="glass-card faq-item" style={{ padding: 0, overflow: "hidden", cursor: "pointer" }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.92rem" }}>{faq.q}</span>
                  <span style={{ color: "var(--brand-primary)", flexShrink: 0, marginLeft: "12px" }}>
                    {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </div>
                {openFaq === i && (
                  <div style={{ padding: "0 22px 18px", fontSize: "0.87rem", color: "var(--text-secondary)", lineHeight: 1.72, borderTop: "1px solid var(--border-card)" }}>
                    <div style={{ paddingTop: "14px" }}>{faq.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
