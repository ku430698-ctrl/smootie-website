"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MULTI_MARKET_TICKERS } from "@/lib/data";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MarketTicker() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(trackRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.5 }
      );
    });
    return () => ctx.revert();
  }, []);

  const doubled = [...MULTI_MARKET_TICKERS, ...MULTI_MARKET_TICKERS];

  return (
    <div className="ticker-bar" aria-label="Live market ticker">
      <div ref={trackRef} className="ticker-track">
        {doubled.map((t, i) => (
          <span key={i} className="ticker-item">
            <span style={{
              fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em",
              padding: "2px 7px", borderRadius: "4px", textTransform: "uppercase",
              background: t.market === "Stocks" ? "rgba(59,91,219,0.10)" :
                          t.market === "Forex"  ? "rgba(14,165,233,0.10)" : "rgba(245,158,11,0.12)",
              color: t.market === "Stocks" ? "var(--brand-primary)" :
                     t.market === "Forex"  ? "var(--brand-accent)" : "#b45309",
            }}>{t.market}</span>
            <span className="ticker-symbol">{t.symbol}</span>
            <span>{t.price}</span>
            <span className={t.positive ? "ticker-up" : "ticker-down"} style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              {t.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {t.change}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
