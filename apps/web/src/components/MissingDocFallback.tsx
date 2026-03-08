'use client';
import { useUIStore } from '@/store/useUIStore';

interface Props {
  affiliateUrl?: string;
}

const SF = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif`;

export default function MissingDocFallback({ affiliateUrl = 'https://pf.kakao.com/dummy' }: Props) {
  const isDark     = useUIStore((s) => s.theme) === "dark";
  const cardBg     = isDark ? "#1C1C1E"                    : "#FFFFFF";
  const iconBg     = isDark ? "#2C2C2E"                    : "#F5F5F7";
  const titleColor = isDark ? "#FFFFFF"                    : "#1D1D1F";
  const subColor   = isDark ? "#A1A1A6"                    : "#86868B";
  const shadow     = isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.08)";

  return (
    <div style={{ backgroundColor: cardBg, borderRadius: 18, padding: 20, overflow: "hidden", boxShadow: shadow }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%", backgroundColor: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 12, fontSize: 22,
      }}>
        📄
      </div>
      <p style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.022em", color: titleColor, marginBottom: 4, fontFamily: SF }}>
        본국 서류 발급이 필요하신가요?
      </p>
      <p style={{ fontSize: 13, color: subColor, lineHeight: 1.5, marginBottom: 16, fontFamily: SF }}>
        파트너 행정사를 통해 24시간 비대면 발급/번역 공증이 가능합니다.
      </p>
      <button
        onClick={() => window.open(affiliateUrl, "_blank", "noopener,noreferrer")}
        onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = "scale(0.96)"; e.currentTarget.style.opacity = "0.8"; }}
        onMouseUp={(e: React.MouseEvent<HTMLButtonElement>) =>    { e.currentTarget.style.transform = "scale(1)";   e.currentTarget.style.opacity = "1"; }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = "scale(1)";   e.currentTarget.style.opacity = "1"; }}
        style={{
          display: "inline-flex", alignItems: "center",
          padding: "8px 16px", borderRadius: 9999,
          backgroundColor: "#0071E3", color: "#fff",
          fontSize: 13, fontWeight: 600, letterSpacing: "-0.022em",
          border: "none", cursor: "pointer",
          transition: "transform 100ms linear, opacity 100ms linear",
          fontFamily: SF,
        }}
      >
        제휴 행정사 톡 연결하기 ↗
      </button>
    </div>
  );
}