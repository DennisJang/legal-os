"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePaymentStore } from "@/store/usePaymentStore";

declare const TossPayments: (clientKey: string) => {
  requestBillingAuth: (method: string, options: Record<string, string>) => Promise<void>;
};

const CLIENT_KEY   = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "test_ck_placeholder";
const CUSTOMER_KEY = `user_${Math.random().toString(36).slice(2, 10)}`;
type Phase = "idle" | "loading" | "success" | "error";

export default function TossPaywall() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [errMsg, setErrMsg] = useState("");
  const { activateSubscription } = usePaymentStore();
  const router = useRouter();

  const handleSubscribe = async () => {
    setPhase("loading");
    try {
      const toss = TossPayments(CLIENT_KEY);
      await toss.requestBillingAuth("카드", {
        customerKey: CUSTOMER_KEY,
        successUrl: `${window.location.origin}/billing/success`,
        failUrl:    `${window.location.origin}/billing/fail`,
      });
    } catch (e: unknown) {
      setPhase("error");
      setErrMsg(e instanceof Error ? e.message : "결제 오류가 발생했습니다.");
    }
  };

  const FEATURES = [
    ["🛂", "비자 점수 실시간 트래킹 + D-Day 알림"],
    ["💰", "체불 임금 자동 감지 + 진정서 1클릭"],
    ["🏠", "전세 계약서 AI 위험 스캔"],
    ["📠", "관할 관공서 팩스 자동 라우팅"],
  ];

  return (
    /* Base Background — grouped view = #F5F5F7 */
    <main style={{
      minHeight: "100vh", backgroundColor: "#F5F5F7",
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
    }}>
      <div style={{ maxWidth: 430, margin: "0 auto", overflowX: "hidden", paddingInline: 20, paddingTop: 64, paddingBottom: 48 }}>

        {/* Hero — H1 헌법 적용 */}
        <div style={{ marginBottom: 40 }}>
          <span style={{
            display: "inline-block", fontSize: 13, fontWeight: 600, color: "#0071E3",
            padding: "4px 12px", borderRadius: 9999, backgroundColor: "rgba(0,113,227,0.1)",
            marginBottom: 16,
          }}>
            PREMIUM 구독 플랜
          </span>
          <h1 style={{
            fontSize: 34, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.04em",
            color: "#1D1D1F", margin: "0 0 12px",
          }}>
            월 4,900원으로<br />100만 원의<br />
            <span style={{ color: "#0071E3" }}>과태료를 방어</span>하세요
          </h1>
          <p style={{ fontSize: 17, color: "#86868B", lineHeight: 1.47, letterSpacing: "-0.022em", margin: 0 }}>
            비자·임금·주거 문제를 한 앱에서 해결
          </p>
        </div>

        {/* Feature Cards — White Card Surface */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
          {FEATURES.map(([icon, text]) => (
            <div key={text} style={{
              display: "flex", alignItems: "center", gap: 16,
              backgroundColor: "#FFFFFF", borderRadius: 18, overflow: "hidden",
              padding: "16px 20px",
            }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{icon}</span>
              <span style={{ fontSize: 17, color: "#1D1D1F", letterSpacing: "-0.022em", lineHeight: 1.47 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Pricing Card */}
        <div style={{
          backgroundColor: "#FFFFFF", borderRadius: 18, overflow: "hidden",
          padding: "24px 20px", marginBottom: 16, textAlign: "center",
        }}>
          <p style={{ fontSize: 13, color: "#86868B", margin: "0 0 4px" }}>월 정기결제</p>
          <p style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.04em",
                      color: "#1D1D1F", margin: "0 0 4px", lineHeight: 1.1 }}>
            ₩4,900
          </p>
          <p style={{ fontSize: 13, color: "#86868B", margin: 0 }}>VAT 포함 · 언제든 해지 가능</p>
        </div>

        {/* CTA — Apple Blue, h-56, rounded-14, font-600 */}
        <button onClick={handleSubscribe}
          disabled={phase === "loading" || phase === "success"}
          style={{
            width: "100%", height: 56, borderRadius: 14, border: "none",
            backgroundColor: phase === "success" ? "#34C759" : "#0071E3",
            color: "#fff", fontSize: 17, fontWeight: 600,
            letterSpacing: "-0.022em", cursor: phase === "loading" ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 100ms linear", opacity: phase === "loading" ? 0.7 : 1,
            fontFamily: "inherit",
          }}
          onMouseDown={(e) => { if (phase === "idle") Object.assign(e.currentTarget.style, { transform: "scale(0.97)", opacity: "0.8" }); }}
          onMouseUp={(e)   => Object.assign(e.currentTarget.style, { transform: "scale(1)", opacity: phase === "loading" ? "0.7" : "1" })}
          onMouseLeave={(e)=> Object.assign(e.currentTarget.style, { transform: "scale(1)", opacity: phase === "loading" ? "0.7" : "1" })}
        >
          {phase === "loading" && <Spinner />}
          {phase === "idle"    && "구독하기"}
          {phase === "loading" && "결제 진행 중..."}
          {phase === "success" && "🎉 구독 완료!"}
          {phase === "error"   && "다시 시도하기"}
        </button>

        {phase === "error" && (
          <p style={{ marginTop: 12, fontSize: 13, color: "#FF3B30", textAlign: "center" }}>{errMsg}</p>
        )}

        <p style={{ marginTop: 16, fontSize: 13, color: "#86868B", textAlign: "center", lineHeight: 1.5 }}>
          첫 달 무료 체험 · 카드 정보는 토스에서 직접 관리됩니다
        </p>
      </div>
    </main>
  );
}

function Spinner() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none"
         style={{ animation: "spin 0.7s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx={9} cy={9} r={7} stroke="rgba(255,255,255,0.4)" strokeWidth={2.5} />
      <path d="M9 2a7 7 0 0 1 7 7" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}