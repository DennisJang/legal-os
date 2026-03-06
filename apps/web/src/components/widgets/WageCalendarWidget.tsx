'use client';
import { useState, useEffect, useRef } from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';
import DailyLogBottomSheet from '@/components/DailyLogBottomSheet';

function useCountUp(target: number, duration = 500) {
  const [display, setDisplay] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const start = prev.current, diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      setDisplay(Math.round(start + diff * p));
      if (p < 1) requestAnimationFrame(tick);
      else prev.current = target;
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return display;
}

function buildCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  return [...Array(firstDay).fill(null), ...Array.from({ length: lastDate }, (_, i) => i + 1)];
}

const SF = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif`;
const DAYS_KR = ['일','월','화','수','목','금','토'];

export default function WageCalendarWidget() {
  const { markedDates, monthlyWage, wageLoading } = useDashboardStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();
  const days  = buildCalendarDays(year, month);

  // 🚨 관제탑 패치: Domain C 실제 리턴값인 total_pay 사용
  const totalWage   = monthlyWage?.total_pay ?? 0;
  const displayWage = useCountUp(totalWage);

  return (
    <>
      <div style={{
        backgroundColor: "#FFFFFF", borderRadius: 18,
        overflow: "hidden", padding: 20,
        fontFamily: SF,
      }}>
        {/* Header */}
        <p style={{ fontSize: 13, color: "#86868B", marginBottom: 4, letterSpacing: "-0.01em" }}>
          {year}년 {month + 1}월 합법 예상 급여
        </p>
        <div style={{ height: 40, marginBottom: 16, display: "flex", alignItems: "center" }}>
          {wageLoading ? (
            <span style={{
              fontSize: 24, fontWeight: 700, letterSpacing: "-0.04em",
              color: "#86868B", opacity: 0.5,
            }}>
              계산 중...
            </span>
          ) : (
            <p style={{
              fontSize: 34, fontWeight: 700, letterSpacing: "-0.04em",
              color: "#1D1D1F", lineHeight: 1.1, margin: 0,
            }}>
              ₩{displayWage.toLocaleString()}
            </p>
          )}
        </div>

        {/* Day labels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
          {DAYS_KR.map((d, i) => (
            <p key={d} style={{
              textAlign: "center", fontSize: 11, fontWeight: 600,
              color: i === 0 ? "#FF3B30" : i === 6 ? "#0071E3" : "#86868B",
              padding: "4px 0", margin: 0,
            }}>
              {d}
            </p>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px 0" }}>
          {days.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const dateStr  = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const isMarked = markedDates.has(dateStr);
            const isToday  = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
            return (
              <button key={dateStr} onClick={() => setSelectedDate(dateStr)}
                onMouseDown={e => Object.assign(e.currentTarget.style, { transform: "scale(0.88)" })}
                onMouseUp={e =>    Object.assign(e.currentTarget.style, { transform: "scale(1)" })}
                onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: "scale(1)" })}
                style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  paddingBlock: 6, borderRadius: 10, border: "none",
                  background: isToday ? "#0071E3" : "transparent",
                  cursor: "pointer", fontFamily: SF,
                  transition: "transform 100ms linear",
                }}
              >
                <span style={{
                  fontSize: 15, fontWeight: isToday ? 700 : 400, lineHeight: 1,
                  color: isToday ? "#FFFFFF" : "#1D1D1F",
                }}>
                  {day}
                </span>
                {isMarked && (
                  <span style={{
                    marginTop: 3, width: 4, height: 4, borderRadius: "50%",
                    background: isToday ? "#FFFFFF" : "#0071E3",
                    display: "block",
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <DailyLogBottomSheet date={selectedDate} onClose={() => setSelectedDate(null)} />
      )}
    </>
  );
}