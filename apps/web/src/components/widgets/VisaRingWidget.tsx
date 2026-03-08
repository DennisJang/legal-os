"use client";

import { useEffect, useRef, useState } from "react";
import { useUIStore } from "@/store/useUIStore";

interface VisaRingWidgetProps {
  score:       number;
  target:      number;
  label:       string;
  size?:       "sm" | "md" | "lg";
  optimistic?: boolean;
  expiryDays?: number;
  onUpdate?:   () => void;
}

const SIZES = {
  sm: { outer: 80,  r: 33, sw: 6, fs: 18, sub: 10 },
  md: { outer: 112, r: 47, sw: 7, fs: 24, sub: 11 },
  lg: { outer: 136, r: 57, sw: 8, fs: 28, sub: 12 },
};

const ringColor = (pct: number) =>
  pct >= 0.8 ? "#34C759" : pct >= 0.5 ? "#FF9500" : "#FF3B30";

const SF: React.CSSProperties = {
  fontFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif`,
};

export default function VisaRingWidget({
  score, target, label, size = "md", optimistic = false, expiryDays, onUpdate,
}: VisaRingWidgetProps) {
  const { outer, r, sw, fs, sub } = SIZES[size];
  const circ   = 2 * Math.PI * r;
  const pct    = Math.min(score / target, 1);
  const offset = circ * (1 - pct);
  const color  = ringColor(pct);
  const cx = outer / 2;
  const cy = outer / 2;

  /* ── 테마 토큰 ── */
  const isDark = useUIStore((s) => s.theme) === "dark";
  const trackColor  = isDark ? "#2C2C2E" : "#E5E5EA";
  const scoreColor  = isDark ? "#FFFFFF"  : "#1D1D1F";
  const labelColor  = isDark ? "#A1A1A6"  : "#86868B";
  const updateColor = "#0071E3"; // Apple Blue — 라이트/다크 공통

  const [displayed, setDisplayed] = useState(0);
  const [numPop,    setNumPop]    = useState(false);
  const prev = useRef(score);

  useEffect(() => { setDisplayed(score); }, []);

  useEffect(() => {
    if (prev.current === score) return;
    const diff = score - displayed, steps = 20, step = diff / steps;
    let i = 0;
    const t = setInterval(() => {
      setDisplayed(v => { const n = v + step; if (++i >= steps) { clearInterval(t); return score; } return n; });
    }, 30);
    prev.current = score;
    setNumPop(true);
    setTimeout(() => setNumPop(false), 600);
    return () => clearInterval(t);
  }, [score]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: outer, height: outer }}>
        <svg width={outer} height={outer} style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth={sw} />
          <circle
            cx={cx} cy={cy} r={r} fill="none"
            stroke={color} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 800ms cubic-bezier(0.25,0.1,0.25,1), stroke 400ms ease" }}
          />
        </svg>

        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{
            fontSize: fs, fontWeight: 700, color: scoreColor,
            letterSpacing: "-0.04em", lineHeight: 1, ...SF,
            ...(numPop ? { animation: "numPop 500ms cubic-bezier(0.34,1.56,0.64,1) forwards" } : {}),
          }}>
            {Math.round(displayed)}
          </span>
          <span style={{ fontSize: sub, color: labelColor, marginTop: 2, ...SF }}>/ {target}</span>
        </div>

        {optimistic && (
          <div style={{
            position: "absolute", inset: -6, borderRadius: "50%",
            border: `2px solid ${color}`, opacity: 0.4,
            animation: "optimisticPulse 1s ease infinite",
          }} />
        )}
      </div>

      <span style={{ fontSize: 13, fontWeight: 600, color: labelColor, letterSpacing: "-0.01em", ...SF }}>
        {label}
      </span>

      {expiryDays !== undefined && (
        <div style={{
          background: expiryDays <= 14 ? "rgba(255,59,48,0.10)" : expiryDays <= 30 ? "rgba(255,149,0,0.10)" : "rgba(52,199,89,0.10)",
          color:      expiryDays <= 14 ? "#FF3B30" : expiryDays <= 30 ? "#FF9500" : "#34C759",
          borderRadius: 9999, padding: "3px 10px",
          fontSize: 12, fontWeight: 700, ...SF,
        }}>
          D-{expiryDays}
        </div>
      )}

      {onUpdate && (
        <button
          onClick={onUpdate}
          style={{ background: "none", border: "none", color: updateColor, fontSize: 13, fontWeight: 600, cursor: "pointer", ...SF, transition: "transform 100ms linear, opacity 100ms linear" }}
          onMouseDown={e => { e.currentTarget.style.transform = "scale(0.95)"; }}
          onMouseUp={e   => { e.currentTarget.style.transform = ""; }}
        >
          스펙 갱신 →
        </button>
      )}
    </div>
  );
}