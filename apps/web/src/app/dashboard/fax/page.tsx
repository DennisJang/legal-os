"use client";
import { useState } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useSubmitStore } from "@/store/useSubmitStore";
import LiabilityActionSheet from "@/components/LiabilityActionSheet";
import MissingDocFallback from "@/components/MissingDocFallback";

const T = {
  bg: "#F5F5F7", surface: "#FFFFFF", primary: "#1D1D1F",
  secondary: "#86868B", blue: "#0071E3", green: "#34C759",
  amber: "#FF9500", red: "#FF3B30",
  font: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif`,
};

const css = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .press { transition: transform 100ms linear, opacity 100ms linear; cursor: pointer; }
  .press:active { transform: scale(0.96); opacity: 0.8; }
`;

const FAX_TYPES = [
  { id: "housing",  icon: "🏠", title: "체류지 변경 신고",   sub: "이사 후 14일 이내 필수 · 과태료 100만원 방어", badge: "D-9",  badgeColor: "#FF3B30" },
  { id: "nhis",     icon: "🏥", title: "건보 피부양자 등록", sub: "월 ₩70,000 절감 예상",                         badge: null,  badgeColor: "" },
  { id: "wage",     icon: "⚖️", title: "임금 체불 진정서",   sub: "팩트 기반 자동 생성",                          badge: null,  badgeColor: "" },
];

export default function FaxPage() {
  const { user } = useDashboardStore();
  const { submitFax, faxStatus } = useSubmitStore();

  const [selected,      setSelected]      = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showFallback,   setShowFallback]   = useState(false);
  const [hasDoc,         setHasDoc]         = useState<boolean | null>(null);

  const isSending = faxStatus === "pending";
const isDone    = faxStatus === "success";

  const handleSelect = (id: string) => {
    setSelected(id);
    setHasDoc(null);
  };

  const handleDocCheck = (has: boolean) => {
    setHasDoc(has);
    if (!has) setShowFallback(true);  // [보완 3] Fallback 라우팅
    else setShowDisclaimer(true);
  };

  const handleConfirm = () => {
  setShowDisclaimer(false);
  submitFax();
  };

  return (
    <main style={{ background: T.bg, minHeight: "100vh", paddingBottom: 100, fontFamily: T.font }}>
      <style>{css}</style>

      {/* Sticky Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(245,245,247,0.85)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "0.5px solid rgba(0,0,0,0.06)",
        padding: "16px 20px 12px",
      }}>
        <div style={{ maxWidth: 430, margin: "0 auto" }}>
          <p style={{ fontSize: 13, color: T.secondary, marginBottom: 2 }}>Zero-Visit 행정 자동화</p>
          <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.04em", color: T.primary, lineHeight: 1.1 }}>
            팩스 발송
          </h1>
        </div>
      </header>

      <div style={{ maxWidth: 430, margin: "0 auto", paddingInline: 20, paddingTop: 24 }}>

        {/* 완료 상태 */}
        {isDone && (
          <div style={{
            background: `${T.green}12`, borderRadius: 14, padding: 20,
            display: "flex", alignItems: "center", gap: 14, marginBottom: 16,
            borderLeft: `3px solid ${T.green}`,
            animation: "fadeSlideUp 380ms cubic-bezier(0.32,0.72,0,1) forwards",
          }}>
            <span style={{ fontSize: 32 }}>✅</span>
            <div>
              <p style={{ fontSize: 17, fontWeight: 700, color: T.green }}>발송 완료!</p>
              <p style={{ fontSize: 13, color: T.secondary, marginTop: 2 }}>
                관할 기관으로 팩스가 전송되었습니다. 신분증 사본은 1시간 내 자동 소각됩니다.
              </p>
            </div>
          </div>
        )}

        {/* 팩스 유형 선택 */}
        <div style={{
          background: T.surface, borderRadius: 18, overflow: "hidden", marginBottom: 16,
          animation: "fadeSlideUp 380ms cubic-bezier(0.32,0.72,0,1) forwards",
        }}>
          <div style={{ padding: "16px 20px 8px" }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: T.primary, letterSpacing: "-0.022em" }}>
              발송 유형 선택
            </h2>
          </div>

          {FAX_TYPES.map((f, i) => {
            const isActive = selected === f.id;
            return (
              <div key={f.id}>
                {i > 0 && <div style={{ height: 0.5, background: "#F2F2F7", marginLeft: 76 }} />}
                <button
                  className="press"
                  onClick={() => handleSelect(f.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 20px", border: "none", width: "100%",
                    background: isActive ? `${T.blue}08` : "transparent",
                    cursor: "pointer", fontFamily: T.font, textAlign: "left",
                    transition: "background 200ms ease",
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: isActive ? `${T.blue}18` : `${T.secondary}12`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                    transition: "background 200ms ease",
                  }}>
                    {f.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: T.primary, letterSpacing: "-0.022em" }}>
                      {f.title}
                    </p>
                    <p style={{ fontSize: 12, color: T.secondary, marginTop: 2 }}>{f.sub}</p>
                  </div>
                  {f.badge && (
                    <div style={{
                      background: f.badgeColor, borderRadius: 9999,
                      padding: "3px 8px", fontSize: 12, fontWeight: 700, color: "white",
                    }}>
                      {f.badge}
                    </div>
                  )}
                  {isActive && (
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: T.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>✓</span>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* 서류 보유 여부 — 선택 시 노출 */}
        {selected && hasDoc === null && (
          <div style={{
            background: T.surface, borderRadius: 18, padding: 20, marginBottom: 16,
            animation: "fadeSlideUp 300ms cubic-bezier(0.32,0.72,0,1) forwards",
          }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: T.primary, letterSpacing: "-0.022em", marginBottom: 4 }}>
              외국인등록증(ARC) 사본이 있으신가요?
            </p>
            <p style={{ fontSize: 13, color: T.secondary, marginBottom: 16 }}>
              팩스 발송 시 서식 뒤에 자동 병합됩니다.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="press" onClick={() => handleDocCheck(true)}
                style={{
                  flex: 1, height: 48, borderRadius: 12, border: `1.5px solid ${T.blue}`,
                  background: `${T.blue}08`, color: T.blue,
                  fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: T.font,
                }}>
                있어요 ✓
              </button>
              <button className="press" onClick={() => handleDocCheck(false)}
                style={{
                  flex: 1, height: 48, borderRadius: 12, border: "1.5px solid #E5E5EA",
                  background: T.surface, color: T.secondary,
                  fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: T.font,
                }}>
                없어요
              </button>
            </div>
          </div>
        )}

        {/* 메인 CTA */}
        {selected && hasDoc && (
          <button
            className="press"
            onClick={() => setShowDisclaimer(true)}
            disabled={isSending}
            style={{
              width: "100%", height: 56, borderRadius: 14, border: "none",
              background: isSending ? T.secondary : T.blue,
              color: "white", fontSize: 17, fontWeight: 600,
              cursor: isSending ? "default" : "pointer", fontFamily: T.font,
              animation: "fadeSlideUp 300ms cubic-bezier(0.32,0.72,0,1) forwards",
            }}
          >
            {isSending ? "발송 중..." : "📠 팩스 발송하기"}
          </button>
        )}
      </div>

      {/* [보완 5] 면책 동의 — 로직 동결 */}
      <LiabilityActionSheet
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
        onConfirm={handleConfirm}
      />

      {/* [보완 3] Fallback 라우팅 — 로직 동결 */}
      {showFallback && (
  <div>
    <MissingDocFallback />
    <button
      onClick={() => { setShowFallback(false); setSelected(null); }}
      style={{
        width: "100%", height: 48, borderRadius: 12, border: "none",
        background: "#F5F5F7", color: "#86868B",
        fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 12,
        fontFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`,
        transition: "all 100ms linear",
      }}
    >
      돌아가기
    </button>
  </div>
    )}
    </main>
  );
}