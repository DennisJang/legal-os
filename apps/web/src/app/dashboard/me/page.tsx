"use client";
import { useState } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { usePaymentStore } from "@/store/usePaymentStore";
import SpecUpdateModal from "@/components/SpecUpdateModal";

const T = {
  bg: "#F5F5F7", surface: "#FFFFFF", primary: "#1D1D1F",
  secondary: "#86868B", blue: "#0071E3", green: "#34C759",
  red: "#FF3B30",
  font: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif`,
};

const css = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .press { transition: transform 100ms linear, opacity 100ms linear; cursor: pointer; }
  .press:active { transform: scale(0.96); opacity: 0.8; }
`;

const Row = ({ label, value, action, onPress }: {
  label: string; value?: string; action?: string; onPress?: () => void;
}) => (
  <button
    className="press"
    onClick={onPress}
    style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 20px", border: "none", background: "transparent",
      width: "100%", cursor: onPress ? "pointer" : "default", fontFamily: T.font,
    }}
  >
    <span style={{ fontSize: 15, color: T.primary, letterSpacing: "-0.022em" }}>{label}</span>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {value && <span style={{ fontSize: 15, color: T.secondary }}>{value}</span>}
      {action && <span style={{ fontSize: 15, color: T.blue, fontWeight: 600 }}>{action}</span>}
      {onPress && <span style={{ color: "#C7C7CC", fontSize: 18 }}>›</span>}
    </div>
  </button>
);

const Divider = () => <div style={{ height: 0.5, background: "#F2F2F7", marginLeft: 20 }} />;

export default function MePage() {
  const { user } = useDashboardStore();
  const { status, planType, resetSubscription } = usePaymentStore();
  const [showSpec, setShowSpec] = useState(false);

  const isPremium   = planType === "PREMIUM_LEGAL" || status === "ACTIVE";
  const statusColor = status === "ACTIVE" ? T.green : status === "PAST_DUE" ? T.red : T.secondary;
  const statusLabel = status === "ACTIVE" ? "구독 중" : status === "PAST_DUE" ? "결제 실패" : status === "CANCELED" ? "해지됨" : "미구독";

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
        <div style={{ maxWidth: 430, margin: "0 auto" }}>
          <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.04em", color: T.primary, lineHeight: 1.1 }}>
            내 정보
          </h1>
        </div>
      </header>

      <div style={{ maxWidth: 430, margin: "0 auto", paddingInline: 20, paddingTop: 24 }}>

        {/* 프로필 카드 */}
        <div style={{
          background: T.surface, borderRadius: 18, padding: 20, marginBottom: 16,
          display: "flex", alignItems: "center", gap: 16,
          animation: "fadeSlideUp 380ms cubic-bezier(0.32,0.72,0,1) forwards",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
            background: `${T.blue}15`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28,
          }}>
            👤
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: T.primary, letterSpacing: "-0.03em" }}>
              {user?.full_name ?? "이름 미설정"}
            </p>
            <p style={{ fontSize: 13, color: T.secondary, marginTop: 2 }}>
              {user?.email ?? ""}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: statusColor }}>
                {isPremium ? "Premium Legal" : statusLabel}
              </span>
            </div>
          </div>
          <button
            className="press"
            onClick={() => setShowSpec(true)}
            style={{
              padding: "8px 14px", borderRadius: 9999, border: "none",
              background: T.blue, color: "white",
              fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font,
            }}
          >
            스펙 갱신
          </button>
        </div>

        {/* 내 스펙 */}
        <div style={{
          background: T.surface, borderRadius: 18, overflow: "hidden", marginBottom: 16,
          animation: "fadeSlideUp 380ms 60ms cubic-bezier(0.32,0.72,0,1) both",
        }}>
          <div style={{ padding: "16px 20px 8px" }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: T.primary, letterSpacing: "-0.022em" }}>내 스펙</h2>
          </div>
          <Divider />
          <Row label="국적"       value={user?.nationality        ?? "미설정"} />
          <Divider />
          <Row label="현재 비자"  value={user?.current_visa_code  ?? "미설정"} />
          <Divider />
          <Row label="목표 비자"  value={user?.target_visa_code   ?? "미설정"} />
          <Divider />
          <Row label="TOPIK"      value={`${(user as any)?.topik_level ?? 0}급`} />
          <Divider />
          <Row label="연 소득"    value={`₩${((user as any)?.current_annual_income ?? 0).toLocaleString()}`} />
          <Divider />
          <Row label="스펙 갱신" action="수정 →" onPress={() => setShowSpec(true)} />
        </div>

        {/* 구독 관리 */}
        <div style={{
          background: T.surface, borderRadius: 18, overflow: "hidden", marginBottom: 16,
          animation: "fadeSlideUp 380ms 120ms cubic-bezier(0.32,0.72,0,1) both",
        }}>
          <div style={{ padding: "16px 20px 8px" }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: T.primary, letterSpacing: "-0.022em" }}>구독</h2>
          </div>
          <Divider />
          <Row label="플랜"   value={isPremium ? "Premium Legal" : "Basic"} />
          <Divider />
          <Row label="상태"   value={statusLabel} />
          <Divider />
          <Row label="월 구독료" value="₩4,900" />
          {!isPremium && (
            <>
              <Divider />
              <Row label="업그레이드" action="구독하기 →" onPress={() => window.location.href = "/billing"} />
            </>
          )}
          {isPremium && status === "ACTIVE" && (
            <>
              <Divider />
              <Row
                label="구독 해지"
                action="해지 →"
                onPress={resetSubscription}
              />
            </>
          )}
        </div>

        {/* 로그아웃 */}
        <div style={{
          background: T.surface, borderRadius: 18, overflow: "hidden", marginBottom: 16,
          animation: "fadeSlideUp 380ms 180ms cubic-bezier(0.32,0.72,0,1) both",
        }}>
          <button
            className="press"
            onClick={() => window.location.href = "/"}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "100%", padding: "16px 20px", border: "none",
              background: "transparent", cursor: "pointer", fontFamily: T.font,
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: T.red }}>로그아웃</span>
          </button>
        </div>
      </div>

      {/* 스펙 갱신 모달 — 로직 동결 */}
      {showSpec && <SpecUpdateModal onClose={() => setShowSpec(false)} />}
    </main>
  );
}