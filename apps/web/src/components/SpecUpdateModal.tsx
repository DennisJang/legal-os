'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useDashboardStore } from '@/store/useDashboardStore';

interface Props { onClose: () => void; }


export default function SpecUpdateModal({ onClose }: Props) {
  const { user, updateSpecOptimistic } = useDashboardStore();
  
  // 🛡️ [관제탑 패치] Null Safety (user?.) 적용
  const [income, setIncome] = useState(user?.current_annual_income ?? 0);
  const [topik, setTopik]   = useState(user?.topik_level ?? 0);
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
    // ── 딤 오버레이 (Apple Style 어두운 배경)
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 animate-fade-in" onClick={onClose}>
      {/* ── 바텀 시트 컨테이너 — Apple Spring 등장 & Liquid Glass */}
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[430px] mx-auto rounded-t-[28px] overflow-hidden liquid-glass pb-10 pt-5 px-5 animate-slide-up"
        style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.06)' }}
      >
        <div className="w-10 h-1 rounded-full bg-[#86868B]/40 mx-auto mb-6" />

        <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#1D1D1F] mb-6">
          내 스펙 갱신하기
        </h2>

        <label className="text-[13px] text-[#86868B] block mb-1.5">연봉 (원)</label>
        <input
          type="number"
          value={income || ''}
          onChange={e => setIncome(Number(e.target.value))}
          className="w-full h-[52px] rounded-[14px] bg-[#F5F5F7] px-4 mb-4 text-[17px] text-[#1D1D1F] outline-none tracking-[-0.022em]"
        />

        <label className="text-[13px] text-[#86868B] block mb-1.5">TOPIK 레벨 (0~6)</label>
        <input
          type="number" min={0} max={6}
          value={topik || ''}
          onChange={e => setTopik(Number(e.target.value))}
          className="w-full h-[52px] rounded-[14px] bg-[#F5F5F7] px-4 mb-8 text-[17px] text-[#1D1D1F] outline-none tracking-[-0.022em]"
        />

        {/* 저장 버튼 — Apple Blue CTA */}
        <button
          onClick={handleSave}
          disabled={saving}
          onMouseDown={e => Object.assign(e.currentTarget.style, { transform: 'scale(0.96)', opacity: '0.8' })}
          onMouseUp={e => Object.assign(e.currentTarget.style, { transform: 'scale(1)', opacity: '1' })}
          onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'scale(1)', opacity: '1' })}
          className="w-full h-[56px] rounded-[14px] bg-[#0071E3] text-white font-semibold text-[17px] tracking-[-0.022em] transition-all duration-100 ease-linear disabled:opacity-50"
        >
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  );
}