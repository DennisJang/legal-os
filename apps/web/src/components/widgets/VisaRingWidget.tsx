"use client";
import { useDashboardStore } from "@/store/useDashboardStore";

export default function VisaRingWidget() {
  const { currentScore, targetScore, daysLeft, visaCode, targetVisa, updateVisaScore } =
    useDashboardStore();
  const r = 54, circ = 2 * Math.PI * r;
  const dash = circ * Math.min(currentScore / targetScore, 1);

  return (
    <div className="flex flex-col items-center gap-8 rounded-[24px] bg-[#111] border border-white/10 p-8">
      <div className="relative w-[144px] h-[144px]">
        <svg viewBox="0 0 144 144" className="rotate-[-90deg]" width={144} height={144}>
          <circle cx={72} cy={72} r={r} fill="none" stroke="#222" strokeWidth={10} />
          <circle cx={72} cy={72} r={r} fill="none" stroke="#fff" strokeWidth={10}
            strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
            className="transition-all duration-700 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[24px] font-bold leading-none">{currentScore}</span>
          <span className="text-[12px] text-white/40 mt-[4px]">/{targetScore}점</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[12px] text-white/40 tracking-widest uppercase">{visaCode} → {targetVisa}</p>
        <p className="text-[14px] text-white/70 mt-[4px]">D-{daysLeft}</p>
      </div>
      <button onClick={() => updateVisaScore(5)}
        className="w-full py-[12px] rounded-[16px] bg-white text-[#0A0A0A] text-[14px] font-bold
                   hover:bg-white/90 active:scale-[0.98] transition-all duration-75">
        내 스펙 갱신하기 +5
      </button>
    </div>
  );
}
