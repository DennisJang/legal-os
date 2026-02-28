"use client";
import { useState, useEffect } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";

function getThisMonthWorkedDays(logs: { date: string }[], year: number, month: number) {
  return logs.filter((l) => {
    const d = new Date(l.date);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;
}

export default function WageCalendarWidget() {
  const { workLogs, clockedInToday, dailyWage, toggleClockIn } = useDashboardStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const now = mounted ? new Date() : new Date(0);
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = mounted ? new Date(year, month + 1, 0).getDate() : 28;
  const workedDays = mounted ? getThisMonthWorkedDays(workLogs, year, month) : 0;
  const monthlyWage = workedDays * dailyWage;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, borderRadius:24,
                  backgroundColor:"#111111", border:"1px solid rgba(255,255,255,0.1)",
                  padding:32, color:"#fff" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:11, letterSpacing:3, textTransform:"uppercase", color:"rgba(255,255,255,0.4)" }}>
          이번 달 급여
        </span>
        <span style={{ fontSize:12, fontWeight:700, padding:"4px 8px", borderRadius:8,
                       backgroundColor: clockedInToday ? "#fff" : "rgba(255,255,255,0.1)",
                       color: clockedInToday ? "#0A0A0A" : "rgba(255,255,255,0.6)" }}>
          {clockedInToday ? "출근 중 🟢" : "미출근"}
        </span>
      </div>
      <p style={{ fontSize:32, fontWeight:900, letterSpacing:"-0.5px" }}>
        {mounted ? `₩${monthlyWage.toLocaleString("ko-KR")}` : "₩—"}
      </p>
      <div style={{ display:"flex", gap:4 }}>
        {Array.from({ length: daysInMonth }, (_, i) => (
          <div key={i} style={{ height:8, flex:1, borderRadius:99,
                                 backgroundColor: i < workedDays ? "#fff" : "rgba(255,255,255,0.1)",
                                 transition:"background-color 0.3s" }} />
        ))}
      </div>
      <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>
        {mounted ? `${workedDays}/${daysInMonth}일 · 일급 ₩${dailyWage.toLocaleString("ko-KR")}` : "로딩 중..."}
      </p>
      <button onClick={toggleClockIn} style={{
        marginTop:8, padding:"14px", borderRadius:16, background:"transparent",
        border:"1px solid rgba(255,255,255,0.2)", color:"#fff", fontSize:14,
        fontWeight:700, cursor:"pointer", fontFamily:"inherit"
      }}>
        {clockedInToday ? "퇴근 기록" : "출근 기록"}
      </button>
    </div>
  );
}
