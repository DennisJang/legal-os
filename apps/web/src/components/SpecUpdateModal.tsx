'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useDashboardStore } from '@/store/useDashboardStore';

interface Props { onClose: () => void; }

const SF = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif`;

const inputStyle: React.CSSProperties = {
  width: "100%", height: 52, borderRadius: 14, border: "none",
  backgroundColor: "#F5F5F7", padding: "0 16px",
  fontSize: 17, color: "#1D1D1F", outline: "none",
  letterSpacing: "-0.022em", fontFamily: SF,
  boxSizing: "border-box",
};

export default function SpecUpdateModal({ onClose }: Props) {
  const { user, updateSpecOptimistic } = useDashboardStore();

  const [income, setIncome] = useState(user?.current_annual_income ?? 0);
  const [topik,  setTopik]  = useState(user?.topik_level ?? 0);
  const [saving, setSaving] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSave = async () => {
    setSaving(true);
    await updateSpecOptimistic({ current_annual_income: income, topik_level: topik }, supabase);
    setSaving(false);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        background: "rgba(0,0,0,0.40)",
        backdropFilter: "blur(4px) saturate(120%)",
        WebkitBackdropFilter: "blur(4px) saturate(120%)",
        fontFamily: SF,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 430,
          borderRadius: "28px 28px 0 0", overflow: "hidden",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          paddingBottom: "max(env(safe-area-inset-bottom), 40px)",
          paddingTop: 20, paddingInline: 20,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          animation: "sheetUp 400ms cubic-bezier(0.32,0.72,0,1) forwards",
        }}
      >
        {/* Handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          backgroundColor: "#E5E5EA", margin: "0 auto 24px",
        }} />

        <h2 style={{
          fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em",
          color: "#1D1D1F", marginBottom: 24,
        }}>
          내 스펙 갱신하기
        </h2>

        <label style={{ fontSize: 13, color: "#86868B", display: "block", marginBottom: 6, fontWeight: 600, letterSpacing: "-0.01em" }}>
          연봉 (원)
        </label>
        <input
          type="number"
          value={income || ''}
          onChange={e => setIncome(Number(e.target.value))}
          style={{ ...inputStyle, marginBottom: 16 }}
        />

        <label style={{ fontSize: 13, color: "#86868B", display: "block", marginBottom: 6, fontWeight: 600, letterSpacing: "-0.01em" }}>
          TOPIK 레벨 (0~6)
        </label>
        <input
          type="number" min={0} max={6}
          value={topik || ''}
          onChange={e => setTopik(Number(e.target.value))}
          style={{ ...inputStyle, marginBottom: 32 }}
        />

        {/* CTA — 로직 동결 */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%", height: 56, borderRadius: 14, border: "none",
            backgroundColor: saving ? "#E5E5EA" : "#0071E3",
            color: saving ? "#86868B" : "#FFFFFF",
            fontSize: 17, fontWeight: 600, letterSpacing: "-0.022em",
            cursor: saving ? "not-allowed" : "pointer",
            boxShadow: "none",
            transition: "transform 100ms linear, opacity 100ms linear, background 200ms ease",
            fontFamily: SF,
          }}
          onMouseDown={e => { if (!saving) Object.assign(e.currentTarget.style, { transform: "scale(0.96)", opacity: "0.8" }); }}
          onMouseUp={e =>    Object.assign(e.currentTarget.style, { transform: "scale(1)", opacity: "1" })}
          onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: "scale(1)", opacity: "1" })}
        >
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  );
}