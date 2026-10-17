"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { X, CheckCircle2, Phone } from "lucide-react";
import { EXPERT_INFO } from "@/lib/data";

gsap.registerPlugin(useGSAP);

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  programTitle?: string;
}

const MARKETS = ["Stock Market", "Forex", "Cryptocurrency", "All Three Markets"];
const EXPERIENCE = ["Complete Beginner", "Some Knowledge", "Intermediate", "Advanced"];

export default function InquiryModal({ isOpen, onClose, programTitle }: InquiryModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", market: "", experience: "", message: "" });

  // Animate open/close
  useEffect(() => {
    if (!overlayRef.current || !boxRef.current) return;
    if (isOpen) {
      document.body.style.overflow = "hidden";
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
      gsap.fromTo(boxRef.current, { y: 40, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.38, ease: "back.out(1.4)" });
    } else {
      document.body.style.overflow = "";
      setSubmitted(false);
      setForm({ name: "", email: "", phone: "", market: "", experience: "", message: "" });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, programInterest: programTitle || form.market, type: "enrollment" }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div ref={overlayRef} className="modal-overlay" onClick={onClose}>
      <div ref={boxRef} className="modal-box" onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ width: 60, height: 60, background: "var(--brand-green-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <CheckCircle2 size={28} color="var(--brand-green)" />
            </div>
            <h3 style={{ marginBottom: "10px" }}>Inquiry Submitted!</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.90rem", marginBottom: "20px" }}>
              Kamal Verma will personally reach out within 24 hours via WhatsApp or call.
            </p>
            <a href={`tel:${EXPERT_INFO.phone}`} className="btn-primary" style={{ justifyContent: "center", display: "inline-flex" }}>
              <Phone size={15} /> Call Now: +91 {EXPERT_INFO.phone}
            </a>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h3 style={{ marginBottom: "4px" }}>Program Inquiry</h3>
                {programTitle && (
                  <span className="badge badge-blue" style={{ fontSize: "0.70rem" }}>{programTitle}</span>
                )}
              </div>
              <button onClick={onClose} style={{
                background: "var(--brand-primary-light)", border: "none", cursor: "pointer",
                borderRadius: "8px", padding: "7px", color: "var(--brand-primary)"
              }}>
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input id="modal-name" className="form-input" required placeholder="Your name"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input id="modal-email" className="form-input" type="email" required placeholder="email@example.com"
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input id="modal-phone" className="form-input" type="tel" required placeholder="+91 XXXXX"
                    value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Market Interest</label>
                <select id="modal-market" className="form-select"
                  value={form.market} onChange={(e) => setForm({ ...form, market: e.target.value })}>
                  <option value="">Select market...</option>
                  {MARKETS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <select id="modal-experience" className="form-select"
                  value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })}>
                  <option value="">Select level...</option>
                  {EXPERIENCE.map((x) => <option key={x}>{x}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Message (optional)</label>
                <textarea id="modal-message" className="form-textarea" style={{ minHeight: "90px" }}
                  placeholder="Any specific questions or goals?"
                  value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>

              <button id="modal-submit" type="submit" className="btn-primary"
                disabled={loading}
                style={{ justifyContent: "center", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Sending..." : "Submit Inquiry"}
              </button>

              <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5 }}>
                For educational inquiry only. Not investment advice.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
