"use client";
import { useDashboardStore } from "@/store/useDashboardStore";

const STATUS_MAP = {
  SAFE:    { label: "안전", color: "#ffffff", shadow: "0 0 32px rgba(255,255,255,0.15)" },
  WARNING: { label: "주의", color: "#ffd700", shadow: "0 0 32px rgba(255,215,0,0.25)" },
  DANGER:  { label: "위험", color: "#ff4444", shadow: "0 0 32px rgba(255,68,68,0.25)" },
};

export default function SafeHomeWidget() {
  const { shieldStatus } = useDashboardStore();
  const { label, color, shadow } = STATUS_MAP[shieldStatus];

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:24,
                  borderRadius:24, backgroundColor:"#111111", border:"1px solid rgba(255,255,255,0.1)",
                  padding:32, color:"#fff", boxShadow:shadow }}>
      <span style={{ fontSize:11, letterSpacing:3, textTransform:"uppercase", color:"rgba(255,255,255,0.4)" }}>
        Safe-Home AI 스캐너
      </span>
      <svg width={80} height={96} viewBox="0 0 80 96" fill="none">
        <path d="M40 4L8 18v24c0 22 14.4 42.4 32 50 17.6-7.6 32-28 32-50V18L40 4z"
          fill={color} fillOpacity={0.12} stroke={color} strokeWidth={2} />
        <path d="M28 48l8 8 16-16" stroke={color} strokeWidth={2.5}
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontSize:24, fontWeight:900, color }}>{label}</p>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:4 }}>계약서 AI 분석 완료</p>
      </div>
      <a href="/safe-home" style={{
        display:"block", width:"100%", padding:"14px", borderRadius:16, textAlign:"center",
        border:"1px solid rgba(255,255,255,0.2)", color:"#fff", textDecoration:"none",
        fontSize:14, fontWeight:700
      }}>
        계약서 스캔하기 →
      </a>
    </div>
  );
}
