import { Suspense } from "react";
import BillingSuccessClient from "./BillingSuccessClient";

/** Suspense 경계 — useSearchParams 필수 래핑 (Next.js 14+ 규칙) */
export default function BillingSuccessPage() {
  return (
    <Suspense fallback={<ProcessingScreen />}>
      <BillingSuccessClient />
    </Suspense>
  );
}

function ProcessingScreen() {
  return (
    <main style={{
      minHeight: "100vh", backgroundColor: "#0A0A0A", color: "#fff",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", fontFamily: "monospace", gap: 24,
    }}>
      <svg width={40} height={40} viewBox="0 0 40 40" fill="none"
           style={{ animation: "spin 0.8s linear infinite" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <circle cx={20} cy={20} r={16} stroke="rgba(255,255,255,0.2)" strokeWidth={3} />
        <path d="M20 4a16 16 0 0 1 16 16" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
      </svg>
      <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>결제를 처리하는 중입니다...</p>
    </main>
  );
}