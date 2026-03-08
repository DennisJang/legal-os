"use client";
import { useEffect, useState, useRef } from "react";
import { useUIStore } from "@/store/useUIStore";

const ACTIONS = [
  { icon: "🛂", label: "내 비자 점수 갱신", href: "/dashboard" },
  { icon: "💰", label: "오늘 출퇴근 기록",   href: "/dashboard" },
  { icon: "🏠", label: "계약서 AI 스캔",     href: "/safe-home" },
  { icon: "📠", label: "팩스 발송",           href: "/fax" },
  { icon: "💳", label: "구독 관리",           href: "/billing" },
];

const SF = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif`;

export default function MagicPalette() {
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── 테마 토큰 ── */
  const isDark       = useUIStore((s) => s.theme) === "dark";
  const sheetBg      = isDark ? "rgba(28,28,30,0.94)"    : "rgba(255,255,255,0.72)";
  const handleBg     = isDark ? "rgba(255,255,255,0.12)" : "#E5E5EA";
  const inputBg      = isDark ? "#2C2C2E"                 : "#F5F5F7";
  const inputColor   = isDark ? "#FFFFFF"                 : "#1D1D1F";
  const itemColor    = isDark ? "#FFFFFF"                 : "#1D1D1F";
  const itemHoverBg  = isDark ? "#2C2C2E"                 : "#F5F5F7";
  const iconBg       = isDark ? "#2C2C2E"                 : "#F5F5F7";
  const chevronColor = isDark ? "#636366"                 : "#C7C7CC";
  const footerColor  = isDark ? "#636366"                 : "#86868B";

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(v => !v); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    if (open) { setVisible(true); setQuery(""); setTimeout(() => inputRef.current?.focus(), 50); }
    else setTimeout(() => setVisible(false), 400);
  }, [open]);

  const filtered = ACTIONS.filter(a => a.label.includes(query));

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = "scale(0.96)"; e.currentTarget.style.opacity = "0.8"; }}
        onMouseUp={(e: React.MouseEvent<HTMLButtonElement>) =>    { e.currentTarget.style.transform = "scale(1)";   e.currentTarget.style.opacity = "1"; }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = "scale(1)";   e.currentTarget.style.opacity = "1"; }}
        style={{
          position: "fixed", bottom: 96, right: 20,
          padding: "12px 20px", borderRadius: 9999,
          backgroundColor: "#0071E3", color: "#fff",
          fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          transition: "transform 100ms linear, opacity 100ms linear",
          fontFamily: SF, zIndex: 40, letterSpacing: "-0.01em",
        }}
      >
        ⌘K 검색
      </button>

      {visible && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(0,0,0,0.36)",
            backdropFilter: "blur(8px) saturate(120%)",
            WebkitBackdropFilter: "blur(8px) saturate(120%)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            transition: "opacity 400ms cubic-bezier(0.32,0.72,0,1)",
            opacity: open ? 1 : 0,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 430,
              background: sheetBg,
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              borderRadius: "24px 24px 0 0",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              paddingBottom: "max(env(safe-area-inset-bottom), 32px)",
              transform: open ? "translateY(0)" : "translateY(100%)",
              transition: "transform 400ms cubic-bezier(0.32,0.72,0,1)",
            }}
          >
            {/* Handle */}
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: handleBg }} />
            </div>

            {/* Input */}
            <div style={{ paddingInline: 20, paddingBottom: 8 }}>
              <input
                ref={inputRef} value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="검색하거나 명령어를 입력하세요..."
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 14,
                  border: "none", backgroundColor: inputBg,
                  fontSize: 17, color: inputColor, outline: "none",
                  letterSpacing: "-0.022em", fontFamily: SF,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* List */}
            <ul style={{ listStyle: "none", margin: 0, padding: "4px 0" }}>
              {filtered.map(a => (
                <li key={a.label}>
                  <button
                    onClick={() => { setOpen(false); window.location.href = a.href; }}
                    onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = itemHoverBg; e.currentTarget.style.transform = "scale(0.98)"; }}
                    onMouseUp={(e: React.MouseEvent<HTMLButtonElement>) =>    { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "scale(1)"; }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "scale(1)"; }}
                    style={{
                      display: "flex", alignItems: "center", gap: 16, width: "100%",
                      padding: "14px 20px", border: "none", background: "transparent",
                      color: itemColor, fontSize: 17, letterSpacing: "-0.022em",
                      fontFamily: SF, cursor: "pointer",
                      transition: "transform 100ms linear, background 100ms linear",
                      borderRadius: 12, margin: "0 8px", boxSizing: "border-box",
                    }}
                  >
                    <span style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: iconBg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20,
                    }}>
                      {a.icon}
                    </span>
                    <span style={{ fontWeight: 500 }}>{a.label}</span>
                    <span style={{ marginLeft: "auto", color: chevronColor, fontSize: 18 }}>›</span>
                  </button>
                </li>
              ))}
            </ul>

            <p style={{ textAlign: "center", fontSize: 13, color: footerColor, margin: "12px 0 0", fontFamily: SF }}>
              ESC 닫기 · ⌘K 토글
            </p>
          </div>
        </div>
      )}
    </>
  );
}