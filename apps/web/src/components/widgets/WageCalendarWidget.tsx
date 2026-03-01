"use client";
import { useState, useEffect } from "react";

export default function WageCalendarWidget() {
  const [clockedIn, setClockedIn]   = useState(false);
  const [workedDays, setWorkedDays] = useState(0);
  const [mounted, setMounted]       = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const now          = mounted ? new Date() : new Date(0);
  const daysInMonth  = mounted ? new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() : 28;
  const dailyWage    = 80000; // 추후 user_profiles.current_annual_income 연동
  const monthlyWage  = workedDays * dailyWage;

  const toggleClockIn = () => {
    setClockedIn((v) => !v);
    if (!clockedIn) setWorkedDays((d) => d + 1);
  };

  return (
    <div style={{ backgroundColor: "#FFFFFF", borderRadius: 18, overflow: "hidden", padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: 13, color: "#86868B", margin: 0 }}>이번 달 급여</p>
        <span style={{
          fontSize: 13, fontWeight: 600, padding: "4px 12px", borderRadius: 9999,
          backgroundColor: clockedIn ? "#34C759" : "#F5F5F7",
          color: clockedIn ? "#fff" : "#86868B",
          transition: "all 250ms cubic-bezier(0.25,0.1,0.25,1)",
        }}>
          {clockedIn ? "출근 중" : "미출근"}
        </span>
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.04em",
                   color: "#1D1D1F", margin: "0 0 16px", lineHeight: 1.1 }}>
        {mounted ? `₩${monthlyWage.toLocaleString("ko-KR")}` : "₩—"}
      </h2>
      <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
        {Array.from({ length: daysInMonth }, (_, i) => (
          <div key={i} style={{
            height: 6, flex: 1, borderRadius: 99,
            backgroundColor: i < workedDays ? "#0071E3" : "#F5F5F7",
            transition: "background-color 250ms cubic-bezier(0.25,0.1,0.25,1)",
          }} />
        ))}
      </div>
      <p style={{ fontSize: 13, color: "#86868B", margin: "0 0 16px" }}>
        {mounted ? `${workedDays}/${daysInMonth}일 · 일급 ₩${dailyWage.toLocaleString("ko-KR")}` : "로딩 중..."}
      </p>
      <button onClick={toggleClockIn} style={{
        width: "100%", height: 56, borderRadius: 14, border: "none",
        backgroundColor: clockedIn ? "#F5F5F7" : "#0071E3",
        color: clockedIn ? "#1D1D1F" : "#fff",
        fontSize: 17, fontWeight: 600, cursor: "pointer",
        letterSpacing: "-0.022em", transition: "all 100ms linear", fontFamily: "inherit",
      }}
      onMouseDown={(e) => Object.assign(e.currentTarget.style, { transform: "scale(0.97)", opacity: "0.8" })}
      onMouseUp={(e)   => Object.assign(e.currentTarget.style, { transform: "scale(1)",    opacity: "1"   })}
      onMouseLeave={(e)=> Object.assign(e.currentTarget.style, { transform: "scale(1)",    opacity: "1"   })}
      >
        {clockedIn ? "퇴근 기록" : "출근 기록"}
      </button>
    </div>
  );
}
