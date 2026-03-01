"use client";
import { useDashboardStore } from "@/store/useDashboardStore";

const STATUS_MAP = {
  SAFE:    { label: "안전", pill: "#34C759", text: "#fff" },
  WARNING: { label: "주의", pill: "#FF9F0A", text: "#fff" },
  DANGER:  { label: "위험", pill: "#FF3B30", text: "#fff" },
};

export default function SafeHomeWidget() {
  const { shieldStatus } = useDashboardStore();
  const { label, pill, text } = STATUS_MAP[shieldStatus as keyof typeof STATUS_MAP];

  return (
    <div style={{ backgroundColor: "#FFFFFF", borderRadius: 18, overflow: "hidden", padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: "#86868B", margin: 0 }}>Safe-Home AI 스캐너</p>
        {/* iOS Pill 뱃지 */}
        <span style={{ fontSize: 13, fontWeight: 600, padding: "4px 12px",
                       borderRadius: 9999, backgroundColor: pill, color: text }}>
          {label}
        </span>
      </div>

      {/* 방패 아이콘 */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <svg width={72} height={86} viewBox="0 0 80 96" fill="none">
          <path d="M40 4L8 18v24c0 22 14.4 42.4 32 50 17.6-7.6 32-28 32-50V18L40 4z"
            fill={pill} fillOpacity={0.1} stroke={pill} strokeWidth={2} />
          <path d="M28 48l8 8 16-16" stroke={pill} strokeWidth={2.5}
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <p style={{ fontSize: 13, color: "#86868B", textAlign: "center", margin: "0 0 16px" }}>
        계약서 AI 분석 완료
      </p>

      {/* CTA — Apple Blue */}
      <a href="/safe-home" style={{
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
        계약서 스캔하기 →
      </a>
    </div>
  );
}