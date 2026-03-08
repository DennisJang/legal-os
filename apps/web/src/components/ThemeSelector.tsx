"use client";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";

const FONT = `"SF Pro Display", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif`;

/* ─── 미니 대시보드 목업 ─────────────────────────────────────────── */
function LightMockup() {
  return (
    <div style={{ padding: "14px 16px", background: "#F5F5F7", borderRadius: 12, gap: 8, display: "flex", flexDirection: "column" }}>
      {/* 비자 링 목업 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#FFFFFF", borderRadius: 10, padding: "10px 12px" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #0071E3", borderTopColor: "#E5E5EA" }} />
        <div>
          <div style={{ width: 60, height: 7, borderRadius: 4, background: "#1D1D1F", marginBottom: 4 }} />
          <div style={{ width: 40, height: 6, borderRadius: 4, background: "#86868B" }} />
        </div>
      </div>
      {/* 임금 달력 목업 */}
      <div style={{ background: "#FFFFFF", borderRadius: 10, padding: "10px 12px", display: "flex", gap: 5 }}>
        {[1,1,0,1,1,0,1].map((a, i) => (
          <div key={i} style={{ flex: 1, height: 20, borderRadius: 4, background: a ? "#0071E3" : "#E5E5EA", opacity: a ? 0.85 : 0.4 }} />
        ))}
      </div>
    </div>
  );
}

function DarkMockup() {
  return (
    <div style={{ padding: "14px 16px", background: "#000000", borderRadius: 12, gap: 8, display: "flex", flexDirection: "column" }}>
      {/* 비자 링 목업 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#1C1C1E", borderRadius: 10, padding: "10px 12px" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #FFD60A", borderTopColor: "#3A3A3C" }} />
        <div>
          <div style={{ width: 60, height: 7, borderRadius: 4, background: "#FFFFFF", marginBottom: 4 }} />
          <div style={{ width: 40, height: 6, borderRadius: 4, background: "#A1A1A6" }} />
        </div>
      </div>
      {/* 오로라 버튼 목업 */}
      <div style={{
        borderRadius: 10, padding: "10px 12px", display: "flex", gap: 5,
        background: "linear-gradient(90deg, #0A84FF22, #BF5AF222, #FFD60A22, #30D15822)",
        border: "1px solid rgba(255,214,10,0.3)",
      }}>
        {[1,0,1,1,0,1,1].map((a, i) => (
          <div key={i} style={{ flex: 1, height: 20, borderRadius: 4, background: a ? "#FFD60A" : "#3A3A3C", opacity: a ? 0.8 : 0.4 }} />
        ))}
      </div>
    </div>
  );
}

/* ─── 테마 카드 ──────────────────────────────────────────────────── */
function ThemeCard({
  label, desc, selected, onSelect, children,
  accentColor, isDark,
}: {
  label: string; desc: string; selected: boolean; onSelect: () => void;
  children: React.ReactNode; accentColor: string; isDark: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        width: "100%", border: "none", cursor: "pointer", padding: 0,
        background: "transparent", textAlign: "left",
        transform: selected ? "scale(1.01)" : "scale(1)",
        transition: "transform 100ms linear",
      }}
      onMouseDown={e => Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(0.97)", opacity: "0.8" })}
      onMouseUp={e => Object.assign((e.currentTarget as HTMLElement).style, { transform: selected ? "scale(1.01)" : "scale(1)", opacity: "1" })}
    >
      <div style={{
        borderRadius: 18, overflow: "hidden",
        border: selected ? `2px solid ${accentColor}` : "2px solid transparent",
        background: isDark ? "#1C1C1E" : "#FFFFFF",
        boxShadow: selected ? `0 0 0 1px ${accentColor}44` : "none",
        transition: "border 200ms ease, box-shadow 200ms ease",
      }}>
        {/* 목업 영역 */}
        <div style={{ padding: "16px 16px 12px" }}>
          {children}
        </div>
        {/* 라벨 영역 */}
        <div style={{
          padding: "12px 16px 14px",
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: isDark ? "#000000" : "#F5F5F7",
        }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: isDark ? "#FFFFFF" : "#1D1D1F", letterSpacing: "-0.02em", margin: 0 }}>{label}</p>
            <p style={{ fontSize: 12, color: isDark ? "#A1A1A6" : "#86868B", margin: "2px 0 0", letterSpacing: "0em" }}>{desc}</p>
          </div>
          {/* 체크 아이콘 */}
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            background: selected ? accentColor : "transparent",
            border: selected ? "none" : `2px solid ${isDark ? "#3A3A3C" : "#D1D1D6"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 250ms cubic-bezier(0.25,0.1,0.25,1)",
            flexShrink: 0,
          }}>
            {selected && (
              <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                <path d="M1 5L5 9L12 1" stroke={isDark ? "#000000" : "#FFFFFF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

/* ─── 메인 컴포넌트 ──────────────────────────────────────────────── */
export default function ThemeSelector() {
  const router = useRouter();
  const { theme, toggleTheme } = useUIStore();

  const handleSelect = (selected: "light" | "dark") => {
    if (theme !== selected) toggleTheme();
  };

  const handleStart = () => router.push("/dashboard");

  return (
    <div style={{
      minHeight: "100dvh", background: "#000000",
      display: "flex", flexDirection: "column",
      fontFamily: FONT, maxWidth: 430, margin: "0 auto",
      padding: "0 20px", paddingTop: 64, paddingBottom: 40,
    }}>
      {/* 타이틀 */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: "#86868B", letterSpacing: "0em", marginBottom: 6 }}>Step 2 of 2</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.04em", lineHeight: 1.2, margin: 0 }}>
          나만의 테마를<br />선택하세요
        </h1>
      </div>

      {/* 카드 목록 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        <ThemeCard
          label="라이트 모드" desc="Apple 감성 — 깔끔하고 밝은 테마"
          selected={theme === "light"} onSelect={() => handleSelect("light")}
          accentColor="#0071E3" isDark={false}
        >
          <LightMockup />
        </ThemeCard>

        <ThemeCard
          label="다크 모드" desc="네온 다크 — 강렬하고 몰입감 있는 테마"
          selected={theme === "dark"} onSelect={() => handleSelect("dark")}
          accentColor="#FFD60A" isDark={true}
        >
          <DarkMockup />
        </ThemeCard>
      </div>

      {/* CTA 버튼 */}
      <button
        onClick={handleStart}
        style={{
          marginTop: 32, width: "100%", height: 56, borderRadius: 14,
          background: theme === "dark" ? "#FFD60A" : "#0071E3",
          color: theme === "dark" ? "#000000" : "#FFFFFF",
          fontSize: 17, fontWeight: 600, border: "none",
          cursor: "pointer", fontFamily: FONT, letterSpacing: "-0.022em",
          transition: "background 300ms ease, color 300ms ease, transform 100ms linear",
        }}
        onMouseDown={e => Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(0.96)", opacity: "0.8" })}
        onMouseUp={e => Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(1)", opacity: "1" })}
      >
        이 테마로 시작하기
      </button>
    </div>
  );
}