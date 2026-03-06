"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";          // ✅ 추가
import VisaRingWidget    from "@/components/widgets/VisaRingWidget";
import WageCalendarWidget from "@/components/widgets/WageCalendarWidget";
import SafeHomeWidget    from "@/components/widgets/SafeHomeWidget";
import MagicPalette      from "@/components/MagicPalette";

/* ─── Design Tokens ─── */
const T = {
  bg:        "#F5F5F7",
  surface:   "#FFFFFF",
  primary:   "#1D1D1F",
  secondary: "#86868B",
  blue:      "#0071E3",
  green:     "#34C759",
  red:       "#FF3B30",
  amber:     "#FF9500",
  font:      `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif`,
};

const globalCss = `
  .press { transition: transform 100ms linear, opacity 100ms linear; cursor: pointer; }
  .press:active { transform: scale(0.96); opacity: 0.8; }
  .fade-in { animation: fadeIn 300ms ease forwards; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .tab-bar {
    position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
    width: 100%; max-width: 430px;
    background: rgba(255,255,255,0.72); backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-top: 0.5px solid rgba(0,0,0,0.08);
    padding: 8px 0 16px; z-index: 100;
  }
`;

/* ─── Sub-components ─── */

const SubBadge = ({ plan }: { plan: string }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    background: plan === "PREMIUM_LEGAL" ? `${T.blue}15` : `${T.secondary}10`,
    borderRadius: 9999, padding: "4px 10px",
  }}>
    <div style={{ width: 6, height: 6, borderRadius: "50%", background: plan === "PREMIUM_LEGAL" ? T.blue : T.secondary }} />
    <span style={{ fontSize: 12, fontWeight: 600, color: plan === "PREMIUM_LEGAL" ? T.blue : T.secondary }}>
      {plan === "PREMIUM_LEGAL" ? "Premium Legal" : "Basic"}
    </span>
  </div>
);

const PushBanner = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="fade-in" style={{
      background: T.blue, borderRadius: 14, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
    }}>
      <span style={{ fontSize: 22 }}>⏰</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "white", letterSpacing: "-0.022em" }}>
          오늘 출퇴근 기록하셨나요?
        </p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
          매일 9시 · 18시 로컬 알림 (서버비 ₩0)
        </p>
      </div>
      <button
        className="press"
        onClick={() => setVisible(false)}
        style={{
          background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8,
          color: "white", padding: "6px 10px", fontSize: 12, fontWeight: 600,
          cursor: "pointer", fontFamily: T.font,
        }}
      >
        기록
      </button>
    </div>
  );
};

// ✅ onFax prop 추가
const DDayCounter = ({ days, onFax }: { days: number; onFax: () => void }) => {
  const color = days <= 14 ? T.red : days <= 30 ? T.amber : T.green;
  return (
    <div style={{
      background: `${color}12`, borderRadius: 12, padding: "12px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16,
    }}>
      <div>
        <p style={{ fontSize: 13, color: T.secondary, letterSpacing: "-0.01em" }}>이사 신고 마감</p>
        <p style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: "-0.04em", marginTop: 2 }}>
          D-{days}
        </p>
      </div>
      <button
        className="press"
        onClick={onFax}                               // ✅ 교체
        style={{
          padding: "8px 16px", borderRadius: 9999, border: "none",
          background: `${color}18`, color, fontSize: 13, fontWeight: 600,
          cursor: "pointer", fontFamily: T.font,
        }}
      >
        팩스 발송하기
      </button>
    </div>
  );
};

// ✅ href 경로 교정 + onNav prop 추가
const FEATURE_ROWS = [
  { icon: "📮", title: "이사 신고 팩스",      sub: "출입국관리소 자동 라우팅", badge: "D-9", color: T.red,     href: "/dashboard/fax?type=housing" },
  { icon: "🏥", title: "건보료 피부양자 등록", sub: "₩70,000 절감 예상",        badge: null,  color: "#5E5CE6", href: "/dashboard/fax?type=nhis"    },
  { icon: "⚖️", title: "임금 체불 진정서",     sub: "팩트 기반 자동 생성",       badge: null,  color: T.amber,   href: "/dashboard/fax?type=wage"    },
];

const QuickActions = ({ onNav }: { onNav: (href: string) => void }) => (  // ✅ prop 추가
  <div style={{ background: T.surface, borderRadius: 18, overflow: "hidden", marginBottom: 16 }}>
    <div style={{ padding: "16px 20px 8px" }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: T.primary, letterSpacing: "-0.022em" }}>빠른 실행</h2>
    </div>
    {FEATURE_ROWS.map((f, i) => (
      <div key={f.title}>
        {i > 0 && <div style={{ height: 0.5, background: "#F2F2F7", marginLeft: 76 }} />}
        <button
          className="press"
          onClick={() => onNav(f.href)}               // ✅ 교체
          style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 20px", border: "none", background: "transparent",
            width: "100%", cursor: "pointer", fontFamily: T.font, textAlign: "left",
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: `${f.color}15`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>
            {f.icon}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: T.primary, letterSpacing: "-0.022em" }}>{f.title}</p>
            <p style={{ fontSize: 13, color: T.secondary, marginTop: 1 }}>{f.sub}</p>
          </div>
          {f.badge && (
            <div style={{ background: T.red, borderRadius: 9999, padding: "3px 8px", fontSize: 12, fontWeight: 700, color: "white" }}>
              {f.badge}
            </div>
          )}
          <span style={{ color: "#C7C7CC", fontSize: 20 }}>›</span>
        </button>
      </div>
    ))}
  </div>
);

const SubscriptionCard = ({ onNav }: { onNav: (href: string) => void }) => (  // ✅ prop 추가
  <div
    onClick={() => onNav("/billing")}                 // ✅ 교체
    style={{
      borderRadius: 18, overflow: "hidden", padding: 20, marginBottom: 16,
      background: "linear-gradient(135deg, #0071E3 0%, #5E5CE6 100%)",
      cursor: "pointer",
    }}
  >
    <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>
      Premium Legal 구독 중
    </p>
    <p style={{ fontSize: 22, fontWeight: 700, color: "white", letterSpacing: "-0.04em", lineHeight: 1.2, marginBottom: 16 }}>
      월 ₩4,900으로<br />법적 리스크를 소거합니다
    </p>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {["✓ 무제한 팩스", "✓ AI 분석", "✓ 24h 지원"].map(t => (
        <span key={t} style={{
          padding: "8px 16px", borderRadius: 9999, border: "none",
          background: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.9)",
          fontSize: 13, fontWeight: 600,
        }}>
          {t}
        </span>
      ))}
    </div>
  </div>
);

/* ─── MAIN PAGE ─── */
export default function DashboardPage() {
  const router = useRouter();                         // ✅ 추가

  return (
    <main style={{ background: T.bg, minHeight: "100vh", fontFamily: T.font }}>
      <style>{globalCss}</style>
      <div style={{ maxWidth: 430, margin: "0 auto", overflowX: "hidden", paddingBottom: 100 }}>

        {/* Sticky Header */}
        <header style={{
          position: "sticky", top: 0, zIndex: 40,
          background: "rgba(245,245,247,0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "0.5px solid rgba(0,0,0,0.06)",
          padding: "12px 20px 10px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 13, color: T.secondary, letterSpacing: "-0.01em" }}>
                안녕하세요, <strong style={{ color: T.primary }}>LEGAL-OS</strong> 👋
              </p>
              <SubBadge plan="PREMIUM_LEGAL" />
            </div>
            <button
              className="press"
              onClick={() => router.push("/dashboard/me")}  // ✅ 교체
              style={{
                height: 36, padding: "0 14px", borderRadius: 9999, border: "none",
                background: T.blue, color: "white", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: T.font, display: "flex", alignItems: "center", gap: 6,
              }}
            >
              ✦ 스펙 갱신
            </button>
          </div>
        </header>

        <div style={{ paddingInline: 20, paddingTop: 20 }}>
          <PushBanner />

          {/* ✅ onFax prop 전달 */}
          <DDayCounter
            days={9}
            onFax={() => router.push("/dashboard/fax?type=housing")}
          />

          <section style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
            <VisaRingWidget score={0} target={100} label="비자 점수" />
            <WageCalendarWidget />
            <SafeHomeWidget />
          </section>

          {/* ✅ onNav prop 전달 */}
          <QuickActions onNav={(href) => router.push(href)} />

          {/* ✅ onNav prop 전달 */}
          <SubscriptionCard onNav={(href) => router.push(href)} />
        </div>
      </div>

      <MagicPalette />
    </main>
  );
}