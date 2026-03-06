"use client";

const STATUS_MAP = {
  SAFE:    { label: "안전", pill: "#34C759", text: "#fff" },
  WARNING: { label: "주의", pill: "#FF9F0A", text: "#fff" },
  DANGER:  { label: "위험", pill: "#FF3B30", text: "#fff" },
};

const SF = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif`;

export default function SafeHomeWidget() {
  const shieldStatus = "SAFE";
  const { label, pill, text } = STATUS_MAP[shieldStatus];

  return (
    <div style={{ backgroundColor: "#FFFFFF", borderRadius: 18, overflow: "hidden", padding: 20, fontFamily: SF }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 17, fontWeight: 700, color: "#1D1D1F", margin: 0, letterSpacing: "-0.022em" }}>
            Safe-Home 스캐너
          </p>
          <p style={{ fontSize: 13, color: "#86868B", margin: "3px 0 0" }}>
            계약서 AI 분석
          </p>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, padding: "5px 12px", borderRadius: 9999, backgroundColor: pill, color: text }}>
          {label}
        </span>
      </div>

      {/* Shield icon */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          backgroundColor: `${pill}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width={44} height={52} viewBox="0 0 80 96" fill="none">
            <path d="M40 4L8 18v24c0 22 14.4 42.4 32 50 17.6-7.6 32-28 32-50V18L40 4z"
              fill={pill} fillOpacity={0.15} stroke={pill} strokeWidth={2} />
            <path d="M28 48l8 8 16-16"
              stroke={pill} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <p style={{ fontSize: 13, color: "#86868B", textAlign: "center", margin: "0 0 20px" }}>
        계약서 AI 분석 완료
      </p>

      {/* CTA — <a> → <button> + router */}
      <button
        onClick={() => { window.location.href = "/safe-home"; }}
        onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = "scale(0.96)"; e.currentTarget.style.opacity = "0.8"; }}
        onMouseUp={(e: React.MouseEvent<HTMLButtonElement>) =>    { e.currentTarget.style.transform = "scale(1)";   e.currentTarget.style.opacity = "1"; }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = "scale(1)";   e.currentTarget.style.opacity = "1"; }}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", height: 56, borderRadius: 14,
          backgroundColor: "#0071E3", color: "#fff",
          fontSize: 17, fontWeight: 600, letterSpacing: "-0.022em",
          border: "none", cursor: "pointer", boxShadow: "none",
          transition: "transform 100ms linear, opacity 100ms linear",
          fontFamily: SF,
        }}
      >
        계약서 스캔하기 →
      </button>
    </div>
  );
}