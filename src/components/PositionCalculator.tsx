"use client";

import { useState } from "react";
import { Calculator, ShieldCheck, ArrowRight, TrendingUp, AlertTriangle } from "lucide-react";

export default function PositionCalculator() {
  const [capital, setCapital] = useState<number>(100000);
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG");
  const [entryPrice, setEntryPrice] = useState<number>(2450);
  const [stopLoss, setStopLoss] = useState<number>(2415);

  // Math calculations
  const maxLossAllowed = Math.round((capital * riskPercent) / 100);
  const pointRisk = Math.abs(entryPrice - stopLoss);
  const quantity = pointRisk > 0 ? Math.floor(maxLossAllowed / pointRisk) : 0;
  const capitalRequired = quantity * entryPrice;

  // Targets
  const target12 = direction === "LONG" ? entryPrice + pointRisk * 2 : entryPrice - pointRisk * 2;
  const profit12 = Math.round(quantity * pointRisk * 2);

  const target13 = direction === "LONG" ? entryPrice + pointRisk * 3 : entryPrice - pointRisk * 3;
  const profit13 = Math.round(quantity * pointRisk * 3);

  const isInvalid = direction === "LONG" ? stopLoss >= entryPrice : stopLoss <= entryPrice;

  return (
    <div className="glass-card" style={{ padding: "32px", position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "8px",
              background: "rgba(0, 245, 155, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--bull-color)",
            }}
          >
            <Calculator size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff" }}>
              Interactive Position Sizing & Risk Calculator
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Formula taught by Kamal Verma to eliminate emotional over-leveraging
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px", background: "rgba(10, 16, 26, 0.7)", padding: "4px", borderRadius: "var(--radius-sm)" }}>
          <button
            onClick={() => setDirection("LONG")}
            style={{
              padding: "6px 16px",
              borderRadius: "6px",
              border: "none",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              background: direction === "LONG" ? "var(--bull-color)" : "transparent",
              color: direction === "LONG" ? "#05080e" : "var(--text-secondary)",
              transition: "all 0.2s",
            }}
          >
            LONG (BUY)
          </button>
          <button
            onClick={() => setDirection("SHORT")}
            style={{
              padding: "6px 16px",
              borderRadius: "6px",
              border: "none",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              background: direction === "SHORT" ? "var(--bear-color)" : "transparent",
              color: direction === "SHORT" ? "#ffffff" : "var(--text-secondary)",
              transition: "all 0.2s",
            }}
          >
            SHORT (SELL)
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "28px" }}>
        {/* Left Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: 600 }}>
              Total Trading Capital (₹)
            </label>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value))}
              step={10000}
              className="form-input"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                Risk Per Trade (%)
              </label>
              <span style={{ fontSize: "0.82rem", color: "var(--bull-color)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                {riskPercent}% (₹{maxLossAllowed.toLocaleString()})
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {[0.5, 1.0, 1.5, 2.0].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRiskPercent(r)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    background: riskPercent === r ? "rgba(0, 245, 155, 0.2)" : "rgba(255, 255, 255, 0.05)",
                    border: `1px solid ${riskPercent === r ? "var(--bull-color)" : "var(--border-glass)"}`,
                    borderRadius: "6px",
                    color: riskPercent === r ? "var(--bull-color)" : "var(--text-secondary)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: 600 }}>
                Entry Price (₹)
              </label>
              <input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className="form-input"
                style={{ fontFamily: "var(--font-mono)" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: 600 }}>
                Stop Loss Price (₹)
              </label>
              <input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(Number(e.target.value))}
                className="form-input"
                style={{ fontFamily: "var(--font-mono)" }}
              />
            </div>
          </div>

          {isInvalid && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--bear-color)", fontSize: "0.82rem" }}>
              <AlertTriangle size={15} />
              {direction === "LONG"
                ? "Stop Loss must be strictly lower than Entry Price for a Long trade."
                : "Stop Loss must be strictly higher than Entry Price for a Short trade."}
            </div>
          )}
        </div>

        {/* Right Output Dashboard */}
        <div
          style={{
            background: "rgba(8, 12, 20, 0.9)",
            border: "1px solid rgba(0, 245, 155, 0.2)",
            borderRadius: "var(--radius-md)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "18px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                RECOMMENDED POSITION SIZE
              </span>
              <span className="badge-bull" style={{ fontSize: "0.72rem" }}>
                <ShieldCheck size={13} /> Strict 1.5% Risk Filter
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "2.4rem", fontWeight: 800, color: "#ffffff", fontFamily: "var(--font-mono)" }}>
                {isInvalid ? "0" : quantity.toLocaleString()}
              </span>
              <span style={{ fontSize: "0.95rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                Shares / Units
              </span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Total Trade Value: ₹{isInvalid ? "0" : capitalRequired.toLocaleString()}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", borderTop: "1px solid var(--border-glass)", paddingTop: "16px" }}>
            {/* Target 1:2 */}
            <div style={{ padding: "12px", background: "rgba(0, 245, 155, 0.05)", borderRadius: "8px", border: "1px solid rgba(0, 245, 155, 0.15)" }}>
              <div style={{ fontSize: "0.74rem", color: "var(--bull-color)", fontWeight: 700, marginBottom: "4px" }}>
                TARGET 1:2 RR
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", fontFamily: "var(--font-mono)" }}>
                ₹{isInvalid ? "0" : target12.toFixed(2)}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--bull-color)", fontWeight: 600 }}>
                +₹{isInvalid ? "0" : profit12.toLocaleString()}
              </div>
            </div>

            {/* Target 1:3 */}
            <div style={{ padding: "12px", background: "rgba(0, 210, 255, 0.05)", borderRadius: "8px", border: "1px solid rgba(0, 210, 255, 0.15)" }}>
              <div style={{ fontSize: "0.74rem", color: "var(--cyan-accent)", fontWeight: 700, marginBottom: "4px" }}>
                TARGET 1:3 RR
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", fontFamily: "var(--font-mono)" }}>
                ₹{isInvalid ? "0" : target13.toFixed(2)}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--cyan-accent)", fontWeight: 600 }}>
                +₹{isInvalid ? "0" : profit13.toLocaleString()}
              </div>
            </div>
          </div>

          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
            💡 <em>Notice how the quantity automatically shrinks as your stop loss widens. You never gamble your capital when you trade math, not hope.</em>
          </div>
        </div>
      </div>
    </div>
  );
}
