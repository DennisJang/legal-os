'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useDashboardStore } from '@/store/useDashboardStore';

interface Props {
  date: string;   // "YYYY-MM-DD"
  onClose: () => void;
}

export default function DailyLogBottomSheet({ date, onClose }: Props) {
  const { saveWorkLog } = useDashboardStore();
  const [clockIn,  setClockIn]  = useState('09:00');
  const [clockOut, setClockOut] = useState('18:00');
  const [breakMin, setBreakMin] = useState('60'); // 🛡️ 법적 필수인 휴게시간으로 교체
  const [saving,   setSaving]   = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSave = async () => {
    setSaving(true);
    
    // 🛡️ [관제탑 패치] 자정 넘김(야간) 처리: 퇴근이 출근보다 빠르면 익일로 자동 전환
    const inDate = new Date(`${date}T${clockIn}:00+09:00`);
    const outDate = new Date(`${date}T${clockOut}:00+09:00`);
    
    if (outDate <= inDate) {
      outDate.setDate(outDate.getDate() + 1); 
    }

    await saveWorkLog({
      work_date: date,
      clock_in: inDate.toISOString(),
      clock_out: outDate.toISOString(),
      break_minutes: Number(breakMin) || 0,
    }, supabase);
    
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 animate-fade-in" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[430px] mx-auto rounded-t-[28px] overflow-hidden liquid-glass pb-10 pt-5 px-5 animate-slide-up"
        style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.06)' }}
      >
        <div className="w-10 h-1 rounded-full bg-[#86868B]/40 mx-auto mb-6" />
        <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#1D1D1F] mb-1">
          출퇴근 기록
        </h2>
        <p className="text-[13px] text-[#86868B] mb-6">{date}</p>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="text-[13px] text-[#86868B] block mb-1.5">출근 시간</label>
            <input type="time" value={clockIn} onChange={e => setClockIn(e.target.value)}
              className="w-full h-[52px] rounded-[14px] bg-[#F5F5F7] px-4 text-[17px] text-[#1D1D1F] outline-none tracking-[-0.022em]" />
          </div>
          <div className="flex-1">
            <label className="text-[13px] text-[#86868B] block mb-1.5">퇴근 시간</label>
            <input type="time" value={clockOut} onChange={e => setClockOut(e.target.value)}
              className="w-full h-[52px] rounded-[14px] bg-[#F5F5F7] px-4 text-[17px] text-[#1D1D1F] outline-none tracking-[-0.022em]" />
          </div>
        </div>

        <label className="text-[13px] text-[#86868B] block mb-1.5">휴게 시간 (분)</label>
        <input type="number" value={breakMin} onChange={e => setBreakMin(e.target.value)}
          placeholder="예: 60 (점심시간 등)"
          className="w-full h-[52px] rounded-[14px] bg-[#F5F5F7] px-4 mb-8 text-[17px] text-[#1D1D1F] outline-none tracking-[-0.022em] placeholder:text-[#86868B]" />

        <button
          onClick={handleSave}
          disabled={saving}
          onMouseDown={e => Object.assign(e.currentTarget.style, { transform: 'scale(0.96)', opacity: '0.8' })}
          onMouseUp={e => Object.assign(e.currentTarget.style, { transform: 'scale(1)', opacity: '1' })}
          onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'scale(1)', opacity: '1' })}
          className="w-full h-[56px] rounded-[14px] bg-[#0071E3] text-white font-semibold text-[17px] tracking-[-0.022em] transition-all duration-100 ease-linear disabled:opacity-50"
        >
          {saving ? '계산 중...' : '기록 저장'}
        </button>
      </div>
    </div>
  );
}