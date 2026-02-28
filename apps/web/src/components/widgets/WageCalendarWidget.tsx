"use client";
import { useDashboardStore } from "@/store/useDashboardStore";

/** 이번 달 근무일만 필터 → 월이 바뀌면 자동 0 */
function getThisMonthWorkedDays(logs: { date: string }[]) {
  const now = new Date();
  return logs.filter((l) => {
    const d = new Date(l.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
}

export default function WageCalendarWidget() {
  const { workLogs, clockedInToday, dailyWage, toggleClockIn } = useDashboardStore();

  const now          = new Date();
  const daysInMonth  = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const workedDays   = getThisMonthWorkedDays(workLogs);
  const monthlyWage  = workedDays * dailyWage;

  return (
    <div className="flex flex-col gap-[16px] rounded-[24px] bg-[#111] border border-white/10 p-8">
      <div className="flex items-center justify-between">
        <span className="text-[12px] tracking-widest uppercase text-white/40">이번 달 급여</span>
        <span className={`text-[12px] font-bold px-[8px] py-[4px] rounded-[8px] ${
          clockedInToday ? "bg-white text-[#0A0A0A]" : "bg-white/10 text-white/60"
        }`}>
          {clockedInToday ? "출근 중 🟢" : "미출근"}
        </span>
      </div>
      <p className="text-[32px] font-bold tracking-tight">₩{monthlyWage.toLocaleString("ko-KR")}</p>
      {/* 이번 달 말일 기준 도트 — 다음 달 되면 전부 흰색 사라짐 */}
      <div className="flex gap-[4px]">
        {Array.from({ length: daysInMonth }, (_, i) => (
          <div key={i} className={`h-[8px] flex-1 rounded-full transition-colors duration-300 ${
            i < workedDays ? "bg-white" : "bg-white/10"
          }`} />
        ))}
      </div>
      <p className="text-[12px] text-white/40">{workedDays}/{daysInMonth}일 · 일급 ₩{dailyWage.toLocaleString("ko-KR")}</p>
      <button onClick={toggleClockIn}
        className="mt-[8px] py-[12px] rounded-[16px] border border-white/20 text-[14px] font-bold
                   hover:bg-white/5 active:scale-[0.98] transition-all duration-75">
        {clockedInToday ? "퇴근 기록" : "출근 기록"}
      </button>
    </div>
  );
}
