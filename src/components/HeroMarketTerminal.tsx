"use client";

import { useState, useRef, useEffect } from "react";
import { TrendingUp, TrendingDown, Activity, ChevronUp, ChevronDown, Compass, ShieldCheck } from "lucide-react";

interface MarketConfig {
  symbol: string;
  name: string;
  category: "Stocks" | "Forex" | "Crypto";
  price: string;
  change: string;
  isPositive: boolean;
  high: string;
  low: string;
  rsi: number;
  setup: string;
  sentiment: number; // % buyers
  points: number[];
}

const MARKETS_DATA: MarketConfig[] = [
  {
    symbol: "NIFTY 50",
    name: "Indian Equities",
    category: "Stocks",
    price: "24,846.50",
    change: "+182.40 (+0.74%)",
    isPositive: true,
    high: "24,890.00",
    low: "24,680.15",
    rsi: 61.2,
    setup: "Ascending Channel • Bullish Breakout",
    sentiment: 66,
    points: [120, 115, 128, 122, 135, 130, 142, 138, 155, 148, 168, 162, 178, 172, 190],
  },
  {
    symbol: "BANKNIFTY",
    name: "Banking Index",
    category: "Stocks",
    price: "51,320.80",
    change: "+410.25 (+0.81%)",
    isPositive: true,
    high: "51,450.00",
    low: "50,890.30",
    rsi: 58.7,
    setup: "Key Support Retest • Supply Zone Cleared",
    sentiment: 62,
    points: [110, 118, 114, 125, 121, 136, 132, 145, 140, 156, 150, 165, 160, 176, 185],
  },
  {
    symbol: "EUR / USD",
    name: "Currency Major",
    category: "Forex",
    price: "1.0894",
    change: "+0.0034 (+0.31%)",
    isPositive: true,
    high: "1.0912",
    low: "1.0855",
    rsi: 53.4,
    setup: "Liquidity Sweep • Higher Low Structure",
    sentiment: 57,
    points: [130, 126, 132, 129, 138, 134, 140, 136, 146, 142, 150, 147, 155, 152, 160],
  },
  {
    symbol: "BTC / USD",
    name: "Bitcoin Core",
    category: "Crypto",
    price: "$67,480.00",
    change: "+1,940.00 (+2.96%)",
    isPositive: true,
    high: "$68,200.00",
    low: "$65,120.00",
    rsi: 68.9,
    setup: "Weekly Compression • Institutional Accumulation",
    sentiment: 73,
    points: [90, 105, 98, 118, 112, 130, 122, 145, 138, 160, 152, 175, 168, 188, 205],
  },
];

export default function HeroMarketTerminal() {
  const [activeMarketIndex, setActiveMarketIndex] = useState(0);
  const current = MARKETS_DATA[activeMarketIndex];

  // 3D Tilt & Specular Sheen refs
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, glareX: 50, glareY: 50 });
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; index: number } | null>(null);

  // Live price tick simulation
  const [tickFlash, setTickFlash] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickFlash(true);
      setTimeout(() => setTickFlash(false), 600);
    }, 3800);
    return () => clearInterval(interval);
  }, [activeMarketIndex]);

  // Card mouse movement for 3D tilt & sheen
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rx = ((y - centerY) / centerY) * -7; // max 7 deg tilt
    const ry = ((x - centerX) / centerX) * 7;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ rx, ry, glareX, glareY });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, glareX: 50, glareY: 50 });
    setHoveredPoint(null);
  };

  // SVG Chart path calculation
  const svgWidth = 460;
  const svgHeight = 150;
  const minVal = Math.min(...current.points);
  const maxVal = Math.max(...current.points);
  const range = maxVal - minVal || 1;

  const coords = current.points.map((val, idx) => {
    const x = (idx / (current.points.length - 1)) * (svgWidth - 40) + 20;
    const y = svgHeight - 25 - ((val - minVal) / range) * (svgHeight - 50);
    return { x, y, val, idx };
  });

  const pathD = coords.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${svgHeight - 10} L ${coords[0].x} ${svgHeight - 10} Z`;

  // Chart crosshair calculation on hover
  const handleChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const scaleFactor = svgWidth / svgRect.width;
    const chartX = mouseX * scaleFactor;

    // Find closest point
    let closest = coords[0];
    let minDistance = Infinity;
    coords.forEach((pt) => {
      const d = Math.abs(pt.x - chartX);
      if (d < minDistance) {
        minDistance = d;
        closest = pt;
      }
    });

    setHoveredPoint({ x: closest.x, y: closest.y, val: closest.val, index: closest.idx });
  };

  return (
    <div
      style={{
        perspective: 1200,
        position: "relative",
        width: "100%",
        maxWidth: "520px",
      }}
    >
      {/* 3D Glass Container */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(0)`,
          transition: "transform 0.15s cubic-bezier(0.2, 0, 0.2, 1)",
          transformStyle: "preserve-3d",
          position: "relative",
          background: "rgba(255, 255, 255, 0.78)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          borderRadius: "28px",
          border: "1px solid rgba(255, 255, 255, 0.95)",
          boxShadow: `
            0 24px 60px -12px rgba(59, 91, 219, 0.16),
            0 8px 24px -6px rgba(15, 23, 42, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.9)
          `,
          padding: "24px",
          overflow: "hidden",
        }}
      >
        {/* Physical Specular Glare Sheen Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            borderRadius: "28px",
            background: `radial-gradient(circle 380px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0) 65%)`,
            zIndex: 1,
          }}
        />

        {/* Content with Z-Depth */}
        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Header Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #3b5bdb 0%, #7c3aed 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(59, 91, 219, 0.3)",
                }}
              >
                <Activity size={18} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontWeight: 800, fontSize: "0.98rem", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                    Kamal Verma Terminal
                  </span>
                  <span
                    style={{
                      display: "inline-block",
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#10b981",
                      boxShadow: "0 0 8px #10b981",
                      animation: "pulse 2s infinite",
                    }}
                  />
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 500 }}>
                  Real-time Price Action & Technical Framework
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--brand-primary)",
                background: "var(--brand-primary-light)",
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                border: "1px solid rgba(59, 91, 219, 0.15)",
              }}
            >
              <Compass size={12} />
              15M Timeframe
            </div>
          </div>

          {/* Market Tab Switcher */}
          <div
            style={{
              display: "flex",
              gap: "6px",
              padding: "4px",
              background: "rgba(241, 245, 249, 0.8)",
              borderRadius: "14px",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              marginBottom: "18px",
            }}
          >
            {MARKETS_DATA.map((m, idx) => {
              const isActive = idx === activeMarketIndex;
              return (
                <button
                  key={m.symbol}
                  onClick={() => setActiveMarketIndex(idx)}
                  style={{
                    flex: 1,
                    padding: "7px 4px",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "0.76rem",
                    fontWeight: isActive ? 700 : 600,
                    cursor: "pointer",
                    background: isActive ? "#ffffff" : "transparent",
                    color: isActive ? "var(--brand-primary)" : "var(--text-secondary)",
                    boxShadow: isActive ? "0 2px 8px rgba(0, 0, 0, 0.06)" : "none",
                    transition: "all 0.18s ease",
                  }}
                >
                  {m.symbol}
                </button>
              );
            })}
          </div>

          {/* Current Ticker Hero Price & Metric Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "14px",
              padding: "0 4px",
            }}
          >
            <div>
              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                {current.name} • Spot Reference
              </div>
              <div
                style={{
                  fontSize: "1.9rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "color 0.2s ease",
                }}
              >
                <span>{current.price}</span>
                <span
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "2px",
                    background: current.isPositive ? "rgba(16, 185, 129, 0.12)" : "rgba(244, 63, 94, 0.12)",
                    color: current.isPositive ? "#059669" : "#e11d48",
                    transform: tickFlash ? "scale(1.06)" : "scale(1)",
                    transition: "transform 0.2s ease",
                  }}
                >
                  {current.isPositive ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {current.change}
                </span>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500 }}>
                High: <strong style={{ color: "var(--text-primary)" }}>{current.high}</strong>
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500 }}>
                Low: <strong style={{ color: "var(--text-primary)" }}>{current.low}</strong>
              </div>
            </div>
          </div>

          {/* Interactive SVG Area Chart */}
          <div
            style={{
              position: "relative",
              background: "linear-gradient(180deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.4) 100%)",
              borderRadius: "18px",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              padding: "10px 6px 4px",
              overflow: "hidden",
            }}
          >
            {/* Chart Grid Lines */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(to right, rgba(203, 213, 225, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(203, 213, 225, 0.2) 1px, transparent 1px)",
                backgroundSize: "40px 30px",
                pointerEvents: "none",
              }}
            />

            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              style={{ width: "100%", height: "135px", display: "block", cursor: "crosshair" }}
              onMouseMove={handleChartMouseMove}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <linearGradient id={`gradient-${activeMarketIndex}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b5bdb" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#3b5bdb" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b5bdb" />
                  <stop offset="60%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <path d={areaD} fill={`url(#gradient-${activeMarketIndex})`} />

              {/* Price Line */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {coords.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={i === coords.length - 1 ? 4.5 : 2}
                  fill={i === coords.length - 1 ? "#10b981" : "#3b5bdb"}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              ))}

              {/* Pulsating Beacon on Last Point */}
              <circle
                cx={coords[coords.length - 1].x}
                cy={coords[coords.length - 1].y}
                r="8"
                fill="none"
                stroke="#10b981"
                strokeWidth="1.5"
                opacity="0.75"
              >
                <animate attributeName="r" from="4" to="14" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.9" to="0" dur="1.8s" repeatCount="indefinite" />
              </circle>

              {/* Crosshair indicator when user hovers */}
              {hoveredPoint && (
                <g>
                  {/* Vertical dashed crosshair line */}
                  <line
                    x1={hoveredPoint.x}
                    y1={0}
                    x2={hoveredPoint.x}
                    y2={svgHeight}
                    stroke="#3b5bdb"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.7"
                  />
                  {/* Horizontal crosshair line */}
                  <line
                    x1={0}
                    y1={hoveredPoint.y}
                    x2={svgWidth}
                    y2={hoveredPoint.y}
                    stroke="#3b5bdb"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.7"
                  />
                  {/* Highlighted node */}
                  <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="6" fill="#3b5bdb" stroke="#fff" strokeWidth="2" />
                </g>
              )}
            </svg>

            {/* Hover Tooltip Badge */}
            {hoveredPoint && (
              <div
                style={{
                  position: "absolute",
                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                  top: "14px",
                  transform: "translateX(-50%)",
                  background: "var(--text-primary)",
                  color: "#ffffff",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: "6px",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>Level {hoveredPoint.val}</span>
                <span style={{ color: "#10b981" }}>• Confirmed</span>
              </div>
            )}
          </div>

          {/* Technical Setup & Market Depth Bar */}
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Setup note */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                background: "rgba(59, 91, 219, 0.06)",
                borderRadius: "12px",
                border: "1px solid rgba(59, 91, 219, 0.12)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={16} color="var(--brand-primary)" />
                <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {current.setup}
                </span>
              </div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--brand-primary)" }}>
                RSI: {current.rsi}
              </span>
            </div>

            {/* Orderflow / Sentiment Ratio */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.70rem", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 600 }}>
                <span>Buyers: <strong style={{ color: "#059669" }}>{current.sentiment}%</strong></span>
                <span>Sellers: <strong style={{ color: "#e11d48" }}>{100 - current.sentiment}%</strong></span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: "var(--radius-full)",
                  background: "#fee2e2",
                  overflow: "hidden",
                  display: "flex",
                }}
              >
                <div
                  style={{
                    width: `${current.sentiment}%`,
                    background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating 3D Depth Badges */}
      <div
        style={{
          position: "absolute",
          top: "-14px",
          right: "-12px",
          background: "#ffffff",
          padding: "8px 14px",
          borderRadius: "var(--radius-full)",
          boxShadow: "0 8px 24px rgba(16, 185, 129, 0.2)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "0.78rem",
          fontWeight: 700,
          color: "#059669",
          transform: `translate3d(${tilt.ry * 0.8}px, ${tilt.rx * -0.8}px, 30px)`,
          transition: "transform 0.15s cubic-bezier(0.2, 0, 0.2, 1)",
          zIndex: 4,
          pointerEvents: "none",
        }}
      >
        <TrendingUp size={14} />
        <span>+1,000+ Students Mentored</span>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "-12px",
          left: "-14px",
          background: "#ffffff",
          padding: "8px 14px",
          borderRadius: "var(--radius-full)",
          boxShadow: "0 8px 24px rgba(59, 91, 219, 0.18)",
          border: "1px solid rgba(59, 91, 219, 0.22)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "0.78rem",
          fontWeight: 700,
          color: "var(--brand-primary)",
          transform: `translate3d(${tilt.ry * -0.6}px, ${tilt.rx * 0.6}px, 25px)`,
          transition: "transform 0.15s cubic-bezier(0.2, 0, 0.2, 1)",
          zIndex: 4,
          pointerEvents: "none",
        }}
      >
        <ShieldCheck size={14} />
        <span>Risk-First Rules Only</span>
      </div>
    </div>
  );
}
