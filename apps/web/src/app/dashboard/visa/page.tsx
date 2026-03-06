// apps/web/src/app/dashboard/visa/page.tsx
"use client";
import { useState } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import VisaRingWidget from "@/components/widgets/VisaRingWidget";
import SpecUpdateModal from "@/components/SpecUpdateModal";
import LiabilityActionSheet from "@/components/LiabilityActionSheet";

const T = {
  bg:        "#F5F5F7",
  surface:   "#FFFFFF",
  primary:   "#1D1D1F",
  secondary: "#86868B",
  blue:      "#0071E3",
  green:     "#34C759",
  amber:     "#FF9500",
  red:       "#FF3B30",
  font:      `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif`,
};

const REQUIREMENTS = [
  { key: "income",    label: "소득 기준",   unit: "만원",  target: 8000 },
  { key: "topik",     label: "TOPIK",       unit: "급",    target: 6    },
  { key: "education", label: "학력",        unit: "",      target: 1    },
];

const css = `
  @keyframes numPop {
    0%   { transform: scale(1);    }
    50%  { transform: scale(1.15); }
    100% { transform: scale(1);    }
  }
  @keyframes optimisticPulse {
    0%, 100% { opacity: 0.4; transform: scale(1);    }
    50%       { opacity: 0.1; transform: scale(1.06); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  .row-press { transition: transform 100ms linear, opacity 100ms linear; cursor: pointer; }
  .row-press:active { transform: scale(0.98); opacity: 0.8; }
`;

export default function VisaPage() {
  const { user } = useDashboardStore();
  const [showSpec,       setShowSpec]       = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [optimistic,     setOptimistic]     = useState(false);

  const score      = user?.current_score  ?? 0;
  const target     = user?.target_score   ?? 100;
  const income     = (user as any)?.current_annual_income ?? 0;
  const topik      = (user as any)?.topik_level           ?? 0;
  const fromVisa   = user?.current_visa_code ?? "E-9";
  const toVisa     = user?.target_visa_code  ?? "E-7-4";
  const expiryDays = 87; // TODO: visa_trackers.expiration_date 연산

  const pct   = Math.min(score / target, 1);
  const color = pct >= 0.8 ? T.green : pct >= 0.5 ? T.amber : T.red;

  const handleSpecSaved = () => {
    setOptimistic(true);
    setTimeout(() => setOptimistic(false), 1200);
  };

  return (
    <main style={{ background: T.bg, minHeight: "100vh", paddingBottom: 100, fontFamily: T.font }}>
      <style>{css}</style>

      {/* Sticky Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(245,245,247,0.85)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "0.5px solid rgba(0,0,0,0.06)",
        padding: "16px 20px 12px",
      }}>
        <div style={{ maxWidth: 430, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <p style={{ fontSize: 13, color: T.secondary, letterSpacing: "-0.01em", marginBottom: 2 }}>
              {fromVisa} → <strong style={{ color: T.blue }}>{toVisa}</strong>
            </p>
            <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.04em", color: T.primary, lineHeight: 1.1 }}>
              비자 오토파일럿
            </h1>
          </div>
          <button
            className="row-press"
            onClick={() => setShowSpec(true)}
            style={{
              height: 36, padding: "0 14px", borderRadius: 9999, border: "none",
              background: T.blue, color: "white", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: T.font,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            ✦ 스펙 갱신
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 430, margin: "0 auto", paddingInline: 20, paddingTop: 32 }}>

        {/* 메인 링 3개 */}
        <div style={{
          background: T.surface, borderRadius: 18, padding: 24, marginBottom: 16,
          animation: "fadeSlideUp 380ms cubic-bezier(0.32,0.72,0,1) forwards",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: T.primary, letterSpacing: "-0.022em" }}>
                종합 점수
              </h2>
              <p style={{ fontSize: 13, color: T.secondary, marginTop: 2 }}>
                합격 커트라인 {target}점
              </p>
            </div>
            {optimistic && (
              <div style={{
                background: `${T.green}15`, borderRadius: 9999,
                padding: "6px 12px", fontSize: 13, fontWeight: 600, color: T.green,
                animation: "fadeSlideUp 300ms ease forwards",
              }}>
                ↑ 갱신됨!
              </div>
            )}
          </div>

          {/* 링 3개 */}
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-start" }}>
            <VisaRingWidget
              score={score} target={target} label="종합 점수"
              size="lg" optimistic={optimistic} expiryDays={expiryDays}
            />
            <VisaRingWidget
              score={topik} target={6} label="TOPIK"
              size="md"
            />
            <VisaRingWidget
              score={Math.round(income / 8000 * 100)} target={100} label="소득 점수"
              size="md"
            />
          </div>
        </div>

        {/* D-Day 카드 */}
        <div style={{
          background: `${color}12`, borderRadius: 14, padding: "14px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 16,
          animation: "fadeSlideUp 380ms 60ms cubic-bezier(0.32,0.72,0,1) both",
        }}>
          <div>
            <p style={{ fontSize: 13, color: T.secondary }}>비자 만료까지</p>
            <p style={{ fontSize: 28, fontWeight: 700, color, letterSpacing: "-0.04em", marginTop: 2 }}>
              D-{expiryDays}
            </p>
          </div>
          <button
            className="row-press"
            onClick={() => setShowDisclaimer(true)}
            style={{
              padding: "10px 18px", borderRadius: 14, border: "none",
              background: color, color: "white",
              fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: T.font,
            }}
          >
            통합신청서 발송
          </button>
        </div>

        {/* 요건 체크리스트 */}
        <div style={{
          background: T.surface, borderRadius: 18, overflow: "hidden", marginBottom: 16,
          animation: "fadeSlideUp 380ms 120ms cubic-bezier(0.32,0.72,0,1) both",
        }}>
          <div style={{ padding: "16px 20px 8px" }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: T.primary, letterSpacing: "-0.022em" }}>
              요건 달성 현황
            </h2>
          </div>

          {[
            { label: "소득 기준",  value: `${(income / 100).toFixed(0)}백만원`,  pct: Math.min(income / 8000, 1), met: income >= 2400 },
            { label: "TOPIK 급수", value: `${topik}급`,                          pct: topik / 6,                  met: topik >= 4    },
            { label: "체류 기간",  value: "3년 이상",                             pct: 1,                          met: true          },
          ].map((item, i) => (
            <div key={item.label}>
              {i > 0 && <div style={{ height: 0.5, background: "#F2F2F7", marginLeft: 20 }} />}
              <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                {/* 달성 여부 아이콘 */}
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: item.met ? `${T.green}15` : `${T.red}12`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16,
                }}>
                  {item.met ? "✓" : "✕"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.primary, letterSpacing: "-0.022em" }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: item.met ? T.green : T.secondary }}>
                      {item.value}
                    </span>
                  </div>
                  {/* 진행 게이지 */}
                  <div style={{ height: 4, borderRadius: 2, background: "#E5E5EA", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 2,
                      width: `${item.pct * 100}%`,
                      background: item.met ? T.green : T.amber,
                      transition: "width 800ms cubic-bezier(0.25,0.1,0.25,1)",
                    }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 다음 스텝 안내 */}
        <div style={{
          background: `${T.blue}08`, borderRadius: 14, padding: 16, marginBottom: 16,
          borderLeft: `3px solid ${T.blue}`,
          animation: "fadeSlideUp 380ms 180ms cubic-bezier(0.32,0.72,0,1) both",
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: T.blue, marginBottom: 6 }}>
            💡 다음 액션
          </p>
          <p style={{ fontSize: 14, color: T.primary, lineHeight: 1.6, letterSpacing: "-0.01em" }}>
            {topik < 4
              ? "TOPIK 4급 이상 취득 시 비자 전환 요건을 충족합니다."
              : income < 2400
              ? "연소득 2,400만원 이상 달성 시 신청 가능합니다."
              : "모든 요건을 충족했습니다! 통합신청서를 발송하세요."}
          </p>
        </div>
      </div>

      {/* 스펙 갱신 모달 — 로직 동결 */}
      {showSpec && (
        <SpecUpdateModal onClose={() => { setShowSpec(false); handleSpecSaved(); }} />
      )}

      {/* 면책 동의 — 로직 동결 */}
      {showDisclaimer && (
        <LiabilityActionSheet
          isOpen={showDisclaimer}
          onClose={() => setShowDisclaimer(false)}
          onConfirm={() => {
            setShowDisclaimer(false);
            window.location.href = "/fax";
          }}
        />
      )}
    </main>
  );
}