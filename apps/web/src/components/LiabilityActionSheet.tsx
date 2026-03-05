'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LiabilityActionSheet({ isOpen, onClose, onConfirm }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => { setIsMounted(true); return () => setIsMounted(false); }, []);
  useEffect(() => { if (!isOpen) setAgreed(false); }, [isOpen]);

  if (!isMounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-end transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] mx-auto rounded-t-[28px] p-[20px] pb-[40px]"
        style={{
          background: 'rgba(255,255,255,0.72)', 
          backdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 400ms cubic-bezier(0.32,0.72,0,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-[36px] h-[4px] bg-[#86868B]/40 rounded-full mx-auto mb-[20px]" />

        <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#1D1D1F] mb-[8px]">
          최종 확인 및 법적 책임 동의
        </h2>
        <p className="text-[13px] text-[#86868B] leading-[1.3] mb-[24px]">
          본 서비스는 문서 자동 완성 도구일 뿐 법률 대리를 수행하지 않습니다.
          최종 제출된 정보의 진위 여부 및 반려, 과태료 발생에 대한 모든 법적 책임은
          사용자 본인에게 있습니다.
        </p>

        {/* iOS 토글 스위치 */}
        <div className="flex items-center justify-between mb-[24px]">
          <span className="text-[17px] font-[400] tracking-[-0.022em] text-[#1D1D1F]">
            위 내용에 동의합니다
          </span>
          <button
            onClick={() => setAgreed(v => !v)}
            className="relative w-[51px] h-[31px] rounded-full flex-shrink-0"
            style={{
              background: agreed ? '#34C759' : '#E5E5EA',
              transition: 'all 250ms cubic-bezier(0.25,0.1,0.25,1)',
            }}
          >
            <span
              className="absolute top-[2px] left-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-sm"
              style={{
                transform: agreed ? 'translateX(20px)' : 'translateX(0)',
                transition: 'all 250ms cubic-bezier(0.25,0.1,0.25,1)',
              }}
            />
          </button>
        </div>

        {/* CTA 버튼 — 🛡️ 관제탑 패치: 디자인 헌법 100ms Linear 강제 */}
        <button
          onClick={() => { if (!agreed) return; onConfirm(); }}
          onMouseDown={e => Object.assign(e.currentTarget.style, { transform: 'scale(0.96)', opacity: '0.8' })}
          onMouseUp={e => Object.assign(e.currentTarget.style, { transform: 'scale(1)', opacity: '1' })}
          onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'scale(1)', opacity: '1' })}
          className="w-full h-[56px] rounded-[14px] font-semibold text-[17px] text-white bg-[#0071E3] tracking-[-0.022em]"
          style={{ 
            transition: 'all 100ms linear',
            opacity: agreed ? 1 : 0.5,
            pointerEvents: agreed ? 'auto' : 'none'
          }}
        >
          동의하고 팩스 발송
        </button>
      </div>
    </div>,
    document.body
  );
}