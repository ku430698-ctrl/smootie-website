"use client";

import React from "react";
import Image from "next/image";

interface MarketBrandLogoProps {
  size?: number;
  className?: string;
}

export default function MarketBrandLogo({ size = 40, className = "" }: MarketBrandLogoProps) {
  return (
    <div
      className={`market-brand-logo ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: "10px",
        overflow: "hidden",
        position: "relative",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.55), 0 0 14px rgba(37, 99, 235, 0.28)",
        background: "#080a0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <Image
        src="/images/trading-brand-icon.jpg"
        alt="Kamal Verma Market Growth Emblem"
        fill
        sizes={`${size}px`}
        priority
        style={{
          objectFit: "cover",
          transform: "scale(1.06)",
        }}
      />
    </div>
  );
}
