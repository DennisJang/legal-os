"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePaymentStore } from "@/store/usePaymentStore";
import { fireConfetti } from "@/lib/confetti";

type Phase = "processing" | "success" | "error";

export default function BillingSuccessClient() {
  const [phase, setPhase] = useState<Phase>("processing");
  const [errMsg, setErrMsg] = useState("");
  const params = useSearchParams();
  const router = useRouter();
  const { activateSubscription } = usePaymentStore();

  useEffect(() => {
    const authKey     = params.get("authKey");
    const customerKey = params.get("customerKey");
    if (!authKey || !customerKey) {
      setPhase("error");
      setErrMsg("인증 키가 없습니다.");
      return;
    }

    (async () => {
      try {
        /* ── authKey → Supabase Edge Function POST ── */
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/toss-subscribe-init`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ authKey, customerKey }),
          }
        );
        if (!res.ok) throw new Error(await res.text());

        /* ── Optimistic UI + 폭죽 + 라우팅 ── */
        activateSubscription();
        fireConfetti();
        setPhase("success");
        setTimeout(() => router.push("/"), 2200);
      } catch (e: unknown) {
        setPhase("error");
        setErrMsg(e instanceof Error ? e.message : "서버 오류가 발생했습니다.");
      }
    })();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main style={{
      minHeight: "100vh", backgroundColor: "#0A0A0A", color: "#fff",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", fontFamily: "monospace", gap: 24,
    }}>
      {phase === "processing" && (
        <>
          <svg width={40} height={40} viewBox="0 0 40 40" fill="none"
               style={{ animation: "spin 0.8s linear infinite" }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <circle cx={20} cy={20} r={16} stroke="rgba(255,255,255,0.2)" strokeWidth={3} />
            <path d="M20 4a16 16 0 0 1 16 16" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
          </svg>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>결제를 처리하는 중입니다...</p>
        </>
      )}
      {phase === "success" && (
        <>
          <div style={{ fontSize: 64 }}>🎉</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px", margin: 0 }}>구독 완료!</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>대시보드로 이동합니다...</p>
        </>
      )}
      {phase === "error" && (
        <>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>결제 확인 실패</h1>
          <p style={{ fontSize: 14, color: "#ff6b6b", maxWidth: 320, textAlign: "center" }}>{errMsg}</p>
          <a href="/billing" style={{
            marginTop: 8, padding: "12px 24px", borderRadius: 12,
            background: "#fff", color: "#0A0A0A", fontSize: 14,
            fontWeight: 700, textDecoration: "none",
          }}>다시 시도</a>
        </>
      )}
    </main>
  );
}