'use client';
import { useState, useEffect, useRef } from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';
import DailyLogBottomSheet from '@/components/DailyLogBottomSheet';

function useCountUp(target: number, duration = 500) {
  const [display, setDisplay] = useState(target);
  const prev = useRef(target);
  
  useEffect(() => {
    const start = prev.current;
    const diff  = target - start;
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

export default function WageCalendarWidget() {
  const { markedDates, monthlyWage, wageLoading } = useDashboardStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const now    = new Date();
  const year   = now.getFullYear();
  const month  = now.getMonth();
  const days   = buildCalendarDays(year, month);
  
  // 🚨 관제탑 패치: Domain C 실제 리턴값인 total_pay 사용
  const totalWage   = monthlyWage?.total_pay ?? 0;
  const displayWage = useCountUp(totalWage);  

  return (
    <>
      <div className="bg-[#FFFFFF] rounded-[18px] overflow-hidden p-5"
           style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        <p className="text-[13px] text-[#86868B] mb-1">
          {year}년 {month + 1}월 합법 예상 급여
        </p>
        <div className="h-[40px] mb-4 flex items-center">
          {wageLoading ? (
            <span className="text-[#86868B] text-[24px] font-bold tracking-[-0.04em] animate-pulse">계산 중...</span>
          ) : (
            <p className="text-[34px] font-bold tracking-[-0.04em] text-[#1D1D1F] leading-[1.1]">
              ₩{displayWage.toLocaleString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-7 mb-2">
          {['일','월','화','수','목','금','토'].map(d => (
            <p key={d} className="text-center text-[11px] text-[#86868B] py-1">{d}</p>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {days.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const isMarked = markedDates.has(dateStr);
            const isToday  = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
            
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                onMouseDown={e => Object.assign(e.currentTarget.style, { transform: 'scale(0.96)' })}
                onMouseUp={e => Object.assign(e.currentTarget.style, { transform: 'scale(1)' })}
                onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'scale(1)' })}
                className="flex flex-col items-center py-1.5 rounded-[10px]"
                style={{
                  transition: 'all 100ms linear',
                  background: isToday ? '#0071E3' : 'transparent',
                }}
              >
                <span className="text-[15px] font-medium leading-none"
                  style={{ color: isToday ? '#FFFFFF' : '#1D1D1F' }}>
                  {day}
                </span>
                {/* 출근 완료 도트 */}
                {isMarked && (
                  <span className="mt-1 w-[4px] h-[4px] rounded-full"
                        style={{ background: isToday ? '#FFFFFF' : '#0071E3' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <DailyLogBottomSheet
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  );
}