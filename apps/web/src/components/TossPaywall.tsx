"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePaymentStore } from "@/store/usePaymentStore";
import { fireConfetti } from "@/lib/confetti";

/** 토스페이먼츠 requestBillingAuth 타입 최소 선언 */
declare const TossPayments: (clientKey: string) => {
  requestBillingAuth: (method: string, options: Record<string, string>) => Promise<void>;
};

const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "test_ck_placeholder";
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
      /* ── Step 1. Toss SDK → requestBillingAuth (클라이언트만) ── */
      const toss = TossPayments(CLIENT_KEY);
      await toss.requestBillingAuth("카드", {
        customerKey: CUSTOMER_KEY,
        successUrl: `${window.location.origin}/billing/success`,
        failUrl:    `${window.location.origin}/billing/fail`,
      });
      /* successUrl 리다이렉트 이후 아래 코드는 /billing/success 페이지에서 실행됨 */
    } catch (e: unknown) {
      setPhase("error");
      setErrMsg(e instanceof Error ? e.message : "결제 오류가 발생했습니다.");
    }
  };

  return (
    <main style={{
      minHeight: "100vh", backgroundColor: "#0A0A0A", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "monospace", padding: "32px",
    }}>
      <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>

        {/* 법정 경고 배지 */}
        <div style={{
          display: "inline-block", border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 8, padding: "6px 16px", fontSize: 11,
          letterSpacing: 4, textTransform: "uppercase", color: "rgba(255,255,255,0.5)",
          marginBottom: 32,
        }}>
          구독 플랜 · 월 정기결제
        </div>

        {/* 핵심 카피 */}
        <h1 style={{
          fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900,
          lineHeight: 1.15, letterSpacing: "-1px", marginBottom: 24,
        }}>
          월 <span style={{ color: "#fff", borderBottom: "3px solid #fff" }}>4,900원</span>으로<br />
          <span style={{ color: "rgba(255,255,255,0.5)" }}>100만 원의</span><br />
          과태료를 방어하세요
        </h1>

        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: 48 }}>
          비자 점수 트래커 · 체불 임금 자동 감지<br />
          전세 계약서 AI 분석 · 팩스 자동 발송
        </p>

        {/* 기능 리스트 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 48 }}>
          {[
            ["🛂", "비자 점수 실시간 트래킹 + D-Day 알림"],
            ["💰", "체불 임금 자동 감지 + 진정서 1클릭 발송"],
            ["🏠", "전세 계약서 AI 위험 스캔"],
            ["📠", "관할 관공서 팩스 자동 라우팅"],
          ].map(([icon, text]) => (
            <div key={text} style={{
              display: "flex", alignItems: "center", gap: 16,
              background: "rgba(255,255,255,0.04)", borderRadius: 16,
              padding: "16px 24px", border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", textAlign: "left" }}>{text}</span>
            </div>
          ))}
        </div>

        {/* CTA 버튼 */}
        <button
          onClick={handleSubscribe}
          disabled={phase === "loading" || phase === "success"}
          style={{
            width: "100%", padding: "20px", borderRadius: 16,
            backgroundColor: phase === "success" ? "#00c471" : "#fff",
            color: "#0A0A0A", fontSize: 16, fontWeight: 900,
            border: "none", cursor: phase === "loading" ? "not-allowed" : "pointer",
            letterSpacing: "-0.3px", fontFamily: "inherit",
            transition: "all 0.15s", opacity: phase === "loading" ? 0.7 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}
        >
          {phase === "loading" && <Spinner />}
          {phase === "idle"    && "구독하기 — 월 4,900원"}
          {phase === "loading" && "결제 진행 중..."}
          {phase === "success" && "🎉 구독 완료!"}
          {phase === "error"   && "다시 시도하기"}
        </button>

        {/* 에러 메시지 */}
        {phase === "error" && (
          <p style={{ marginTop: 16, fontSize: 13, color: "#ff6b6b" }}>{errMsg}</p>
        )}

        <p style={{ marginTop: 24, fontSize: 12, color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>
          언제든 해지 가능 · 첫 달 무료 체험 · VAT 포함
        </p>
      </div>
    </main>
  );
}

/** 인라인 스피너 — 외부 의존 0 */
function Spinner() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none"
         style={{ animation: "spin 0.7s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx={9} cy={9} r={7} stroke="#0A0A0A" strokeWidth={2.5} strokeOpacity={0.25} />
      <path d="M9 2a7 7 0 0 1 7 7" stroke="#0A0A0A" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}
