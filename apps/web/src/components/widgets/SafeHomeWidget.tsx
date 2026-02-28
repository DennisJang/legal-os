"use client";
import { useDashboardStore } from "@/store/useDashboardStore";

const STATUS_MAP = {
  SAFE:    { label: "안전", color: "#fff",    glow: "shadow-[0_0_32px_rgba(255,255,255,0.15)]" },
  WARNING: { label: "주의", color: "#ffd700", glow: "shadow-[0_0_32px_rgba(255,215,0,0.25)]" },
  DANGER:  { label: "위험", color: "#ff4444", glow: "shadow-[0_0_32px_rgba(255,68,68,0.25)]" },
};

export default function SafeHomeWidget() {
  const { shieldStatus } = useDashboardStore();
  const { label, color, glow } = STATUS_MAP[shieldStatus];

  return (
    <div className={`flex flex-col items-center gap-[24px] rounded-[24px] bg-[#111] border border-white/10 p-8 ${glow}`}>
      <span className="text-[12px] tracking-widest uppercase text-white/40">Safe-Home AI 스캐너</span>
      <svg width={80} height={96} viewBox="0 0 80 96" fill="none">
        <path d="M40 4L8 18v24c0 22 14.4 42.4 32 50 17.6-7.6 32-28 32-50V18L40 4z"
          fill={color} fillOpacity={0.12} stroke={color} strokeWidth={2} />
        <path d="M28 48l8 8 16-16" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="text-center">
        <p className="text-[24px] font-bold" style={{ color }}>{label}</p>
        <p className="text-[12px] text-white/40 mt-[4px]">계약서 AI 분석 완료</p>
      </div>
      <a href="/safe-home"
        className="w-full py-[12px] rounded-[16px] border border-white/20 text-center text-[14px] font-bold
                   hover:bg-white/5 active:scale-[0.98] transition-all duration-75 block">
        계약서 스캔하기 →
      </a>
    </div>
  );
}
