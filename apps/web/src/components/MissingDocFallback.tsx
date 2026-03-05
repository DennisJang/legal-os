'use client';

interface Props {
  affiliateUrl?: string;
}

export default function MissingDocFallback({ affiliateUrl = 'https://pf.kakao.com/dummy' }: Props) {
  return (
    <div className="bg-[#FFFFFF] rounded-[18px] p-[20px] overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
      {/* 📄 아이콘 */}
      <div className="w-[44px] h-[44px] rounded-full bg-[#F5F5F7] flex items-center justify-center mb-[12px]">
        <span className="text-[22px]">📄</span>
      </div>

      <p className="text-[17px] font-semibold tracking-[-0.022em] text-[#1D1D1F] mb-[4px]">
        본국 서류 발급이 필요하신가요?
      </p>
      <p className="text-[13px] text-[#86868B] leading-[1.3] mb-[16px]">
        파트너 행정사를 통해 24시간 비대면 발급/번역 공증이 가능합니다.
      </p>

      {/* Pill 브릿지 버튼 — 🛡️ 관제탑 패치: 디자인 헌법 100ms Linear 강제 */}
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseDown={e => Object.assign(e.currentTarget.style, { transform: 'scale(0.96)', opacity: '0.8' })}
        onMouseUp={e => Object.assign(e.currentTarget.style, { transform: 'scale(1)', opacity: '1' })}
        onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'scale(1)', opacity: '1' })}
        className="inline-flex items-center px-[16px] py-[8px] rounded-full bg-[#0071E3] text-[13px] font-semibold text-white tracking-[-0.022em]"
        style={{ transition: 'all 100ms linear', textDecoration: 'none' }}
      >
        제휴 행정사 톡 연결하기 ↗
      </a>
    </div>
  );
}