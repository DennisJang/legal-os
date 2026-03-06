"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePaymentStore } from "@/store/usePaymentStore";
import { fireConfetti } from "@/lib/confetti";

type Phase = "processing" | "success" | "error";

const SF = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif`;

export default function BillingSuccessClient() {
  const [phase,  setPhase]  = useState<Phase>("processing");
  const [errMsg, setErrMsg] = useState("");
  const params = useSearchParams();
  const router = useRouter();
  const { activateSubscription } = usePaymentStore();

  useEffect(() => {
    const authKey     = params.get("authKey");
    const customerKey = params.get("customerKey");
    if (!authKey || !customerKey) { setPhase("error"); setErrMsg("인증 키가 없습니다."); return; }

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/toss-subscribe-init`,
          { method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ authKey, customerKey }) }
        );
        if (!res.ok) throw new Error(await res.text());
        activateSubscription();
        fireConfetti();
        setPhase("success");
        setTimeout(() => router.push("/"), 2200);
      } catch (e: unknown) {
        setPhase("error");
        setErrMsg(e instanceof Error ? e.message : "서버 오류가 발생했습니다.");
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main style={{
      minHeight: "100vh", backgroundColor: "#0A0A0A",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 16, padding: 24, fontFamily: SF,
    }}>
      {phase === "processing" && (
        <>
          <svg width={40} height={40} viewBox="0 0 40 40" fill="none"
            style={{ animation: "spin 0.8s linear infinite" }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <circle cx={20} cy={20} r={16} stroke="rgba(255,255,255,0.15)" strokeWidth={3} />
            <path d="M20 4a16 16 0 0 1 16 16" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
          </svg>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", letterSpacing: "-0.022em" }}>
            결제를 처리하는 중입니다...
          </p>
        </>
      )}

      {phase === "success" && (
        <>
          <div style={{ fontSize: 64, lineHeight: 1 }}>🎉</div>
          <h1 style={{
            fontSize: 34, fontWeight: 700, color: "#FFFFFF",
            letterSpacing: "-0.04em", lineHeight: 1.1, margin: 0, textAlign: "center",
          }}>
            구독 완료!
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", letterSpacing: "-0.022em", margin: 0 }}>
            대시보드로 이동합니다...
          </p>
          {/* 진행 표시 바 */}
          <div style={{ width: 200, height: 2, borderRadius: 1, backgroundColor: "rgba(255,255,255,0.1)", marginTop: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", backgroundColor: "#34C759", borderRadius: 1,
              animation: "progressBar 2.2s linear forwards" }} />
          </div>
          <style>{`@keyframes progressBar { from { width: 0% } to { width: 100% } }`}</style>
        </>
      )}

      {phase === "error" && (
        <>
          <div style={{ fontSize: 48, lineHeight: 1 }}>⚠️</div>
          <h1 style={{
            fontSize: 24, fontWeight: 700, color: "#FFFFFF",
            letterSpacing: "-0.02em", margin: 0, textAlign: "center",
          }}>
            결제 확인 실패
          </h1>
          <p style={{
            fontSize: 14, color: "#FF6B6B", maxWidth: 320,
            textAlign: "center", lineHeight: 1.5, letterSpacing: "-0.01em",
          }}>
            {errMsg}
          </p>
          <a href="/billing" style={{
            marginTop: 8, padding: "14px 28px", borderRadius: 14,
            backgroundColor: "#FFFFFF", color: "#1D1D1F",
            fontSize: 15, fontWeight: 600, textDecoration: "none",
            letterSpacing: "-0.022em",
            transition: "transform 100ms linear, opacity 100ms linear",
          }}
          onMouseDown={(e) => Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(0.96)", opacity: "0.8" })}
          onMouseUp={(e)   => Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(1)",    opacity: "1"   })}
          onMouseLeave={(e)=> Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(1)",    opacity: "1"   })}
          >
            다시 시도
          </a>
        </>
      )}
    </main>
  );
}