"use client";
import VisaRingWidget    from "@/components/widgets/VisaRingWidget";
import WageCalendarWidget from "@/components/widgets/WageCalendarWidget";
import SafeHomeWidget    from "@/components/widgets/SafeHomeWidget";
import MagicPalette      from "@/components/MagicPalette";
import GoogleAuthButton  from "@/components/GoogleAuthButton";

const QUICK_ACTIONS = [
  { emoji: "📠", label: "팩스 발송",  href: "/fax" },
  { emoji: "📄", label: "PDF 생성",   href: "/docs" },
  { emoji: "💳", label: "구독 관리",  href: "/billing" },
  { emoji: "⚙️", label: "내 정보",   href: "/profile" },
];

export default function DashboardPage() {
  return (
    <main style={{
      backgroundColor: "#F5F5F7", minHeight: "100vh",
      fontFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif`,
    }}>
      <div style={{ maxWidth: 430, margin: "0 auto", overflowX: "hidden", paddingInline: 20, paddingBottom: 100 }}>

        {/* Sticky Header — Liquid Glass */}
        <header style={{
          position: "sticky", top: 0, zIndex: 40,
          background: "rgba(245,245,247,0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "0.5px solid rgba(0,0,0,0.06)",
          marginInline: -20, paddingInline: 20,
          paddingTop: 16, paddingBottom: 16,
          marginBottom: 24,
        }}>
          <h1 style={{
            fontSize: 34, fontWeight: 700, lineHeight: 1.1,
            letterSpacing: "-0.04em", color: "#1D1D1F", margin: 0,
          }}>
            LEGAL-OS
          </h1>
          <p style={{
            fontSize: 13, color: "#86868B", marginTop: 4,
            letterSpacing: "-0.01em",
          }}>
            한국 거주 외국인 행정 자동화
          </p>
        </header>

        {/* 3대 위젯 */}
        <section style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
          <VisaRingWidget score={0} target={100} label="비자 점수" />
          <WageCalendarWidget />
          <SafeHomeWidget />
        </section>

        {/* 빠른 액션 2단 그리드 */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 40 }}>
          {QUICK_ACTIONS.map(({ emoji, label, href }) => (
            <a key={label} href={href} style={{
              display: "flex", alignItems: "center", gap: 12,
              backgroundColor: "#FFFFFF", borderRadius: 18,
              padding: 16, color: "#1D1D1F", textDecoration: "none",
              overflow: "hidden",
              transition: "transform 100ms linear, opacity 100ms linear",
            }}
            onMouseDown={(e) => Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(0.96)", opacity: "0.8" })}
            onMouseUp={(e)   => Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(1)",    opacity: "1"   })}
            onMouseLeave={(e)=> Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(1)",    opacity: "1"   })}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                backgroundColor: "#F5F5F7",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20,
              }}>
                {emoji}
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.022em" }}>
                {label}
              </span>
            </a>
          ))}
        </section>
      </div>

      <MagicPalette />
    </main>
  );
}