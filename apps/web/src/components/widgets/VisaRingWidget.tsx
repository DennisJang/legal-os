'use client';
import { useState } from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';
import SpecUpdateModal from '@/components/SpecUpdateModal';

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function VisaRingWidget() {
  const { user } = useDashboardStore();
  const [showModal, setShowModal] = useState(false);

  // 🛡️ [관제탑 패치] Null 크래시 방어 (마운트 전 하얀 화면 방지)
  if (!user) return <div className="h-[140px] bg-white rounded-[18px] animate-pulse" />;

  const score      = user.current_score ?? 0;
  const target     = user.target_score  ?? 100;
  const visaCode   = user.current_visa_code ?? "—";
  const targetVisa = user.target_visa_code ?? "—";

  // 🛡️ [관제탑 패치] target이 0일 때 NaN 크래시 방어 (target || 1)
  const pct    = Math.min(score / (target || 1), 1);
  const offset = CIRCUMFERENCE * (1 - pct);

  return (
    <>
      <div
        className="bg-[#FFFFFF] rounded-[18px] overflow-hidden p-5"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
      >
        <p className="text-[13px] text-[#86868B] mb-4">비자 트래커</p>

        {/* 🛡️ 기존의 공간 효율적인 가로(Row) 레이아웃 원복 */}
        <div className="flex items-center gap-5">
          {/* SVG 링 영역 */}
          <div className="relative w-[100px] h-[100px] shrink-0">
            <svg viewBox="0 0 140 140" className="w-[100px] h-[100px] transform -rotate-90">
              {/* 배경 트랙 */}
              <circle cx={70} cy={70} r={RADIUS} fill="none" stroke="#F5F5F7" strokeWidth={10} />
              {/* 진행 게이지 — 1초 쫀득한 애니메이션 */}
              <circle
                cx={70} cy={70} r={RADIUS}
                fill="none"
                stroke="#0071E3"
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1000ms cubic-bezier(0.32, 0.72, 0, 1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[22px] font-bold text-[#1D1D1F] leading-none tracking-[-0.04em]">{score}</span>
              <span className="text-[11px] text-[#86868B] mt-0.5">/{target}</span>
            </div>
          </div>

          {/* 텍스트 및 액션 영역 */}
          <div className="flex-1">
            <h2 className="text-[24px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#1D1D1F] mb-1">
              {visaCode} → {targetVisa}
            </h2>
            <p className="text-[13px] text-[#86868B] mb-4">스펙 갱신 시 점수 반영</p>

            <button
              onClick={() => setShowModal(true)}
              onMouseDown={e => Object.assign(e.currentTarget.style, { transform: 'scale(0.96)', opacity: '0.8' })}
              onMouseUp={e => Object.assign(e.currentTarget.style, { transform: 'scale(1)', opacity: '1' })}
              onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'scale(1)', opacity: '1' })}
              className="flex items-center justify-center w-full h-[44px] rounded-[14px] bg-[#F5F5F7] text-[#0071E3] text-[15px] font-semibold tracking-[-0.022em]"
              style={{ transition: 'all 100ms linear' }}
            >
              내 스펙 갱신하기
            </button>
          </div>
        </div>
      </div>

      {/* 바텀 시트 (Z-Index 분리) */}
      {showModal && <SpecUpdateModal onClose={() => setShowModal(false)} />}
    </>
  );
}