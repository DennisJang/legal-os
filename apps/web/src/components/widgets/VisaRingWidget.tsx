"use client";
import { useDashboardStore } from "@/store/useDashboardStore";

export default function VisaRingWidget() {
  const user = useDashboardStore((s) => s.user);
  const currentScore = user?.current_score ?? 0;
  const targetScore  = user?.target_score  ?? 100;
  const visaCode     = user?.current_visa_code ?? "—";
  const targetVisa   = user?.target_visa_code  ?? "—";
  const r = 54, circ = 2 * Math.PI * r;
  const dash = circ * Math.min(currentScore / (targetScore || 1), 1);

  return (
    <div style={{ backgroundColor: "#FFFFFF", borderRadius: 18, overflow: "hidden", padding: 20 }}>
      <p style={{ fontSize: 13, color: "#86868B", marginBottom: 16 }}>비자 트래커</p>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
          <svg viewBox="0 0 144 144" style={{ transform: "rotate(-90deg)", width: 100, height: 100 }}>
            <circle cx={72} cy={72} r={r} fill="none" stroke="#F5F5F7" strokeWidth={12} />
            <circle cx={72} cy={72} r={r} fill="none" stroke="#0071E3" strokeWidth={12}
              strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
              style={{ transition: "stroke-dasharray 0.7s cubic-bezier(0.4,0,0.2,1)" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#1D1D1F", lineHeight: 1 }}>{currentScore}</span>
            <span style={{ fontSize: 11, color: "#86868B" }}>/{targetScore}</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em",
                       color: "#1D1D1F", margin: "0 0 4px" }}>{visaCode} → {targetVisa}</h2>
          <p style={{ fontSize: 13, color: "#86868B", margin: "0 0 16px" }}>스펙 갱신 시 점수 반영</p>
          <a href="/dashboard/profile" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", height: 56, borderRadius: 14,
            backgroundColor: "#0071E3", color: "#fff", textDecoration: "none",
            fontSize: 17, fontWeight: 600, letterSpacing: "-0.022em",
            transition: "all 100ms linear",
          }}
          onMouseDown={(e) => Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(0.97)", opacity: "0.8" })}
          onMouseUp={(e)   => Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(1)",    opacity: "1"   })}
          onMouseLeave={(e)=> Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(1)",    opacity: "1"   })}
          >
            내 스펙 갱신하기
          </a>
        </div>
      </div>
    </div>
  );
}
