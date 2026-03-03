"use client";
import { useEffect, useState, useRef } from "react";

const ACTIONS = [
  { icon: "🛂", label: "내 비자 점수 갱신", href: "/dashboard" },
  { icon: "💰", label: "오늘 출퇴근 기록",   href: "/dashboard" },
  { icon: "🏠", label: "계약서 AI 스캔",     href: "/safe-home" },
  { icon: "📠", label: "팩스 발송",           href: "/fax" },
  { icon: "💳", label: "구독 관리",           href: "/billing" },
];

export default function MagicPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen((v) => !v); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    if (open) {
      setVisible(true); setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setTimeout(() => setVisible(false), 400);
    }
  }, [open]);

  const filtered = ACTIONS.filter((a) => a.label.includes(query));

  return (
    <>
      {/* FAB — Apple Blue pill */}
      <button onClick={() => setOpen(true)} style={{
        position: "fixed", bottom: 32, right: 20,
        padding: "12px 20px", borderRadius: 9999,
        backgroundColor: "#0071E3", color: "#fff",
        fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
        boxShadow: "0 4px 24px rgba(0,113,227,0.3)",
        transition: "all 100ms linear", fontFamily: "inherit", zIndex: 40,
      }}
      onMouseDown={(e) => Object.assign(e.currentTarget.style, { transform: "scale(0.96)", opacity: "0.8" })}
      onMouseUp={(e)   => Object.assign(e.currentTarget.style, { transform: "scale(1)",    opacity: "1"   })}
      onMouseLeave={(e)=> Object.assign(e.currentTarget.style, { transform: "scale(1)",    opacity: "1"   })}
      >
        ⌘K 검색
      </button>

      {/* Overlay + Modal — Liquid Glass + Spring easing */}
      {visible && (
        <div onClick={() => setOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          paddingBottom: 0,
          transition: "opacity 400ms cubic-bezier(0.32,0.72,0,1)",
          opacity: open ? 1 : 0,
        }}>
          {/* Bottom Sheet — Liquid Glass */}
          <div onClick={(e) => e.stopPropagation()} style={{
            width: "100%", maxWidth: 430,
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            borderRadius: "24px 24px 0 0",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            paddingBottom: 32,
            transform: open ? "translateY(0)" : "translateY(100%)",
            transition: "transform 400ms cubic-bezier(0.32,0.72,0,1)",
          }}>
            {/* Handle Bar */}
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, backgroundColor: "#86868B", opacity: 0.4 }} />
            </div>

            {/* Search Input */}
            <div style={{ paddingInline: 20, paddingBottom: 8 }}>
              <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="검색하거나 명령어를 입력하세요..."
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 14,
                  border: "none", backgroundColor: "#F5F5F7",
                  fontSize: 17, color: "#1D1D1F", outline: "none",
                  letterSpacing: "-0.022em", fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Action List */}
            <ul style={{ listStyle: "none", margin: 0, padding: "8px 0" }}>
              {filtered.map((a) => (
                <li key={a.label}>
                  <a href={a.href} onClick={() => setOpen(false)} style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "14px 20px", textDecoration: "none", color: "#1D1D1F",
                    fontSize: 17, letterSpacing: "-0.022em",
                    transition: "all 100ms linear",
                  }}
                  onMouseDown={(e) => Object.assign((e.currentTarget as HTMLElement).style, { backgroundColor: "#F5F5F7", transform: "scale(0.98)" })}
                  onMouseUp={(e)   => Object.assign((e.currentTarget as HTMLElement).style, { backgroundColor: "transparent", transform: "scale(1)" })}
                  onMouseLeave={(e)=> Object.assign((e.currentTarget as HTMLElement).style, { backgroundColor: "transparent", transform: "scale(1)" })}
                  >
                    <span style={{ fontSize: 22 }}>{a.icon}</span>
                    <span>{a.label}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p style={{ textAlign: "center", fontSize: 13, color: "#86868B", margin: "8px 0 0" }}>
              ESC 닫기 · ⌘K 토글
            </p>
          </div>
        </div>
      )}
    </>
  );
}