'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useDashboardStore } from '@/store/useDashboardStore';

interface Props {
  date: string;
  onClose: () => void;
}

export default function DailyLogBottomSheet({ date, onClose }: Props) {
  const { saveWorkLog } = useDashboardStore();
  const [clockIn,  setClockIn]  = useState('09:00');
  const [clockOut, setClockOut] = useState('18:00');
  const [breakMin, setBreakMin] = useState('60');
  const [saving,   setSaving]   = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSave = async () => {
    setSaving(true);
    const inDate  = new Date(`${date}T${clockIn}:00+09:00`);
    const outDate = new Date(`${date}T${clockOut}:00+09:00`);
    if (outDate <= inDate) outDate.setDate(outDate.getDate() + 1);
    await saveWorkLog({
      work_date:     date,
      clock_in:      inDate.toISOString(),
      clock_out:     outDate.toISOString(),
      break_minutes: Number(breakMin) || 0,
    }, supabase);
    setSaving(false);
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 52, borderRadius: 14,
    backgroundColor: "#F5F5F7", border: "none",
    padding: "0 16px",
    fontSize: 17, color: "#1D1D1F", outline: "none",
    letterSpacing: "-0.022em",
    fontFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`,
    boxSizing: "border-box",
    transition: "border 200ms ease",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13, color: "#86868B", display: "block", marginBottom: 6,
    fontFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`,
    letterSpacing: "-0.01em", fontWeight: 600,
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.36)",
        backdropFilter: "blur(4px) saturate(120%)",
        WebkitBackdropFilter: "blur(4px) saturate(120%)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 430,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderRadius: "24px 24px 0 0",
          paddingBottom: "max(env(safe-area-inset-bottom), 40px)",
          paddingTop: 20, paddingInline: 20,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          animation: "sheetUp 400ms cubic-bezier(0.32,0.72,0,1) forwards",
        }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E5EA", margin: "0 auto 24px" }} />

        <h2 style={{
          fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em",
          color: "#1D1D1F", marginBottom: 4,
          fontFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`,
        }}>
          출퇴근 기록
        </h2>
        <p style={{ fontSize: 13, color: "#86868B", marginBottom: 24,
          fontFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`,
        }}>
          {date}
        </p>

        {/* 출퇴근 시간 row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>출근 시간</label>
            <input type="time" value={clockIn} onChange={e => setClockIn(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>퇴근 시간</label>
            <input type="time" value={clockOut} onChange={e => setClockOut(e.target.value)} style={inputStyle} />
          </div>
        </div>

        {/* 휴게시간 */}
        <label style={labelStyle}>휴게 시간 (분)</label>
        <input
          type="number" value={breakMin} onChange={e => setBreakMin(e.target.value)}
          placeholder="예: 60 (점심시간 등)"
          style={{ ...inputStyle, marginBottom: 32 }}
        />

        {/* CTA */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%", height: 56, borderRadius: 14, border: "none",
            backgroundColor: saving ? "#E5E5EA" : "#0071E3",
            color: saving ? "#86868B" : "#fff",
            fontSize: 17, fontWeight: 600, letterSpacing: "-0.022em",
            cursor: saving ? "not-allowed" : "pointer",
            boxShadow: "none",
            transition: "transform 100ms linear, opacity 100ms linear, background 200ms ease",
            fontFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`,
          }}
          onMouseDown={e => { if (!saving) Object.assign(e.currentTarget.style, { transform: "scale(0.96)", opacity: "0.8" }); }}
          onMouseUp={e => Object.assign(e.currentTarget.style, { transform: "scale(1)", opacity: "1" })}
          onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: "scale(1)", opacity: "1" })}
        >
          {saving ? '계산 중...' : '기록 저장'}
        </button>
      </div>
    </div>
  );
}