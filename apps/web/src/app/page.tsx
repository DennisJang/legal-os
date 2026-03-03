"use client";
import VisaRingWidget from "@/components/widgets/VisaRingWidget";
import WageCalendarWidget from "@/components/widgets/WageCalendarWidget";
import SafeHomeWidget from "@/components/widgets/SafeHomeWidget";
import MagicPalette from "@/components/MagicPalette";
import GoogleAuthButton from "@/components/GoogleAuthButton";

export default function DashboardPage() {
  return (
    <main style={{
      backgroundColor: "#F5F5F7",
      minHeight: "100vh",
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
    }}>
      {/* Root Container — max 430px iOS 캔버스 */}
      <div style={{ maxWidth: 430, margin: "0 auto", overflowX: "hidden", paddingInline: 20 }}>

        {/* Header — Liquid Glass 스티키 */}
        <header style={{
          position: "sticky", top: 0, zIndex: 40,
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          marginInline: -20, paddingInline: 20,
          paddingTop: 16, paddingBottom: 16,
          marginBottom: 24,
        }}>
          <h1 style={{
            fontSize: 34, fontWeight: 700, lineHeight: 1.1,
            letterSpacing: "-0.04em", color: "#1D1D1F", margin: 0,
          }}>LEGAL-OS</h1>
          <p style={{ fontSize: 13, color: "#86868B", marginTop: 4, letterSpacing: 0 }}>
            한국 거주 외국인 행정 자동화
          </p>
        </header>

        {/* 3대 위젯 — 섹션 간 48px */}
        <section style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 48 }}>
          <VisaRingWidget />
          <WageCalendarWidget />
          <SafeHomeWidget />
        </section>

        {/* 빠른 액션 — 2단 그리드 */}
        <section style={{
          display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16, marginBottom: 48,
        }}>
          {[
            { emoji: "📠", label: "팩스 발송",  href: "/fax" },
            { emoji: "📄", label: "PDF 생성",   href: "/docs" },
            { emoji: "💳", label: "구독 관리",  href: "/billing" },
            { emoji: "⚙️", label: "내 정보",    href: "/profile" },
          ].map(({ emoji, label, href }) => (
            <a key={label} href={href} style={{
              display: "flex", alignItems: "center", gap: 12,
              backgroundColor: "#FFFFFF", borderRadius: 18,
              padding: 16, color: "#1D1D1F", textDecoration: "none",
              overflow: "hidden",
              transition: "all 100ms linear",
            }}
            onMouseDown={(e) => Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(0.96)", opacity: "0.8" })}
            onMouseUp={(e)   => Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(1)",    opacity: "1"   })}
            onMouseLeave={(e)=> Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(1)",    opacity: "1"   })}
            >
              <span style={{ fontSize: 24 }}>{emoji}</span>
              <span style={{ fontSize: 17, fontWeight: 400, letterSpacing: "-0.022em" }}>{label}</span>
            </a>
          ))}
        </section>
      </div>

      <MagicPalette />
    </main>
  );
}