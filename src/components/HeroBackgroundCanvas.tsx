"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  depth: number;
}

interface Candlestick {
  x: number;
  y: number;
  originY: number;
  bodyHeight: number;
  wickHeightTop: number;
  wickHeightBottom: number;
  isGreen: boolean;
  width: number;
  floatOffset: number;
  speed: number;
  depth: number;
}

export default function HeroBackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Mouse tracking with smooth interpolation
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      isHovered: false,
      radius: 180,
    };

    // Initialize particles & candlesticks
    let particles: Particle[] = [];
    let candlesticks: Candlestick[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      initElements();
    };

    const initElements = () => {
      // 1. Data nodes (constellation)
      const count = Math.floor((width * height) / 18000);
      particles = [];
      const colors = [
        "rgba(59, 91, 219, ", // Indigo
        "rgba(14, 165, 233, ", // Sky
        "rgba(16, 185, 129, ", // Emerald
        "rgba(168, 85, 247, ", // Violet
      ];

      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const depth = 0.4 + Math.random() * 0.9;
        particles.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: 0,
          vy: 0,
          radius: 1.5 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          depth,
        });
      }

      // 2. Realistic floating candlesticks across depth layers
      candlesticks = [];
      const candleCount = Math.max(12, Math.floor(width / 75));
      for (let i = 0; i < candleCount; i++) {
        const x = (i / candleCount) * width + (Math.random() * 30 - 15);
        const y = 80 + Math.random() * (height - 180);
        const depth = 0.3 + Math.random() * 0.8;
        const isGreen = Math.random() > 0.45;
        const bodyHeight = 16 + Math.random() * 45;
        const wickHeightTop = 8 + Math.random() * 22;
        const wickHeightBottom = 8 + Math.random() * 22;

        candlesticks.push({
          x,
          y,
          originY: y,
          bodyHeight,
          wickHeightTop,
          wickHeightBottom,
          isGreen,
          width: 5 + depth * 3,
          floatOffset: Math.random() * Math.PI * 2,
          speed: 0.001 + Math.random() * 0.0018,
          depth,
        });
      }
    };

    // Event listeners
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.isHovered = true;
    };

    const onMouseLeave = () => {
      mouse.isHovered = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    resize();

    let time = 0;

    // Render loop
    const render = () => {
      time += 0.016;

      // Smooth mouse damping
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      ctx.clearRect(0, 0, width, height);

      // --- 1. Realistic Isometric Perspective Grid ---
      ctx.save();
      const gridStep = 48;
      const mouseOffsetX = (mouse.x - width / 2) * 0.015;
      const mouseOffsetY = (mouse.y - height / 2) * 0.015;

      ctx.strokeStyle = "rgba(59, 91, 219, 0.045)";
      ctx.lineWidth = 1;

      // Vertical grid lines with subtle parallax
      for (let x = 0; x < width + gridStep; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x + mouseOffsetX, 0);
        ctx.lineTo(x - mouseOffsetX, height);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let y = 0; y < height + gridStep; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y + mouseOffsetY);
        ctx.lineTo(width, y - mouseOffsetY);
        ctx.stroke();
      }
      ctx.restore();

      // --- 2. Interactive Cursor Radial Glow ("Flashlight" effect) ---
      if (mouse.x > -500) {
        const glowRadius = 260;
        const radGrad = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, glowRadius
        );
        radGrad.addColorStop(0, "rgba(59, 91, 219, 0.09)");
        radGrad.addColorStop(0.4, "rgba(14, 165, 233, 0.05)");
        radGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 3. Realistic Floating Financial Candlesticks ---
      candlesticks.forEach((candle) => {
        // Floating wave animation
        const floatY = Math.sin(time * candle.speed * 60 + candle.floatOffset) * 14 * candle.depth;
        
        // Parallax offset relative to mouse
        const parallaxX = (mouse.x - width / 2) * 0.02 * candle.depth;
        const parallaxY = (mouse.y - height / 2) * 0.02 * candle.depth;

        const currentX = candle.x - parallaxX;
        const currentY = candle.originY + floatY - parallaxY;

        // Proximity glow to cursor
        const dx = mouse.x - currentX;
        const dy = mouse.y - currentY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isNear = dist < 140;
        const proximityBoost = isNear ? (1 - dist / 140) * 0.4 : 0;

        const baseAlpha = (0.2 + candle.depth * 0.35 + proximityBoost);

        ctx.save();
        if (candle.isGreen) {
          ctx.strokeStyle = `rgba(16, 185, 129, ${baseAlpha * 1.1})`;
          ctx.fillStyle = isNear 
            ? `rgba(16, 185, 129, ${baseAlpha * 0.75})`
            : `rgba(16, 185, 129, ${baseAlpha * 0.45})`;
        } else {
          ctx.strokeStyle = `rgba(244, 63, 94, ${baseAlpha * 1.1})`;
          ctx.fillStyle = isNear 
            ? `rgba(244, 63, 94, ${baseAlpha * 0.75})`
            : `rgba(244, 63, 94, ${baseAlpha * 0.45})`;
        }

        ctx.lineWidth = 1.2;

        // Draw top wick
        ctx.beginPath();
        ctx.moveTo(currentX, currentY - candle.bodyHeight / 2);
        ctx.lineTo(currentX, currentY - candle.bodyHeight / 2 - candle.wickHeightTop);
        ctx.stroke();

        // Draw bottom wick
        ctx.beginPath();
        ctx.moveTo(currentX, currentY + candle.bodyHeight / 2);
        ctx.lineTo(currentX, currentY + candle.bodyHeight / 2 + candle.wickHeightBottom);
        ctx.stroke();

        // Draw candlestick body with rounded pill edges
        const bx = currentX - candle.width / 2;
        const by = currentY - candle.bodyHeight / 2;
        ctx.fillRect(bx, by, candle.width, candle.bodyHeight);
        ctx.strokeRect(bx, by, candle.width, candle.bodyHeight);

        // Soft halo glow if near cursor
        if (isNear) {
          ctx.shadowColor = candle.isGreen ? "#10b981" : "#f43f5e";
          ctx.shadowBlur = 12 * proximityBoost;
          ctx.strokeRect(bx, by, candle.width, candle.bodyHeight);
        }

        ctx.restore();
      });

      // --- 4. Interactive Constellation Particles with Spring Elasticity ---
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Idle drift
        p.originX += Math.cos(time + i) * 0.25;
        p.originY += Math.sin(time + i * 1.2) * 0.25;

        // Mouse interaction (elastic repulsion & attraction)
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && mouse.x > -500) {
          const force = (1 - dist / mouse.radius) * 6 * p.depth;
          const angle = Math.atan2(dy, dx);
          // Gently push away from cursor
          p.vx -= Math.cos(angle) * force * 0.4;
          p.vy -= Math.sin(angle) * force * 0.4;
        }

        // Spring back to origin
        const spring = 0.04;
        const damping = 0.88;
        p.vx += (p.originX - p.x) * spring;
        p.vy += (p.originY - p.y) * spring;
        p.vx *= damping;
        p.vy *= damping;

        p.x += p.vx;
        p.y += p.vy;

        // Draw node
        const alpha = 0.25 + p.depth * 0.45;
        ctx.fillStyle = `${p.color}${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw connecting vectors to nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist2 < 90) {
            const lineAlpha = (1 - dist2 / 90) * 0.14 * Math.min(alpha, 0.4);
            ctx.strokeStyle = `rgba(59, 91, 219, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
