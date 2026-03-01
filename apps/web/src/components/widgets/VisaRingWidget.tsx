"use client";
import { useDashboardStore } from "@/store/useDashboardStore";

export default function VisaRingWidget() {
  const { currentScore, targetScore, daysLeft, visaCode, targetVisa, updateVisaScore } =
    useDashboardStore();
  const r = 54, circ = 2 * Math.PI * r;
  const dash = circ * Math.min(currentScore / targetScore, 1);

  return (
    /* Card Surface — #FFFFFF, rounded-18, overflow-hidden */
    <div style={{ backgroundColor: "#FFFFFF", borderRadius: 18, overflow: "hidden", padding: 20 }}>

      {/* H2 Section Title */}
      <p style={{ fontSize: 13, fontWeight: 400, color: "#86868B", letterSpacing: 0, marginBottom: 16 }}>
        비자 트래커
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* SVG Ring */}
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

        {/* Info */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em",
                       color: "#1D1D1F", margin: "0 0 4px" }}>
            {visaCode} → {targetVisa}
          </h2>
          <p style={{ fontSize: 13, color: "#86868B", margin: "0 0 16px" }}>D-{daysLeft}</p>
          {/* CTA Button — Apple Blue, h-56, rounded-14 */}
          <button onClick={() => updateVisaScore(5)} style={{
            width: "100%", height: 56, borderRadius: 14, border: "none",
            backgroundColor: "#0071E3", color: "#fff", fontSize: 17,
            fontWeight: 600, cursor: "pointer", letterSpacing: "-0.022em",
            transition: "all 100ms linear",
            fontFamily: "inherit",
          }}
          onMouseDown={(e) => Object.assign(e.currentTarget.style, { transform: "scale(0.97)", opacity: "0.8" })}
          onMouseUp={(e)   => Object.assign(e.currentTarget.style, { transform: "scale(1)",    opacity: "1"   })}
          onMouseLeave={(e)=> Object.assign(e.currentTarget.style, { transform: "scale(1)",    opacity: "1"   })}
          >
            내 스펙 갱신하기 +5
          </button>
        </div>
      </div>
    </div>
  );
}