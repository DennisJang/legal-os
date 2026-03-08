"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useUIStore } from "@/store/useUIStore";

/* ══════════════════════════════════════════
   LEGAL-OS Premium Paywall v2
   라이트/다크 테마 대응 — useUIStore 연동
   ⚠️ 로직 완전 동결 — 색상 토큰만 변경
══════════════════════════════════════════ */

const SLIDES = [
  { title: "비자 오토파일럿",      sub: "만료 90일 전, 관할 출입국에\n서류가 자동으로 날아갑니다.",    visual: <VisaVisual /> },
  { title: "임금 체불 방패",       sub: "매일 달력에 찍힌 숫자가\n법정에서 당신의 무기가 됩니다.",  visual: <WageVisual /> },
  { title: "전세 사기 백신",       sub: "계약서를 찍으면 독소 조항을\nAI가 모국어로 경고합니다.",    visual: <HomeVisual /> },
  { title: "이사 과태료 방어",     sub: "14일 카운트다운 시작.\n클릭 한 번으로 팩스 발송 완료.",    visual: <FaxVisual /> },
  { title: "건보료 월 7만 원 절감", sub: "피부양자 등록 서류를 자동 생성해\n건보공단으로 즉시 팩스 발송.", visual: <NhisVisual /> },
];

const PLANS = [
  { id: "monthly", label: "월간", badge: null,   price: "₩4,900",  sub: "언제든 해지 가능." },
  { id: "annual",  label: "연간", badge: "-58%", price: "₩24,000", sub: "₩2,000/월 · 2개월 무료." },
] as const;

type PlanId = (typeof PLANS)[number]["id"];

/* ── 라이트/다크 토큰 맵 ── */
const DARK_T = {
  overlayBg:        "rgba(0,0,0,0.65)",
  sheetBg:          "#0a0a0a",
  sheetShadow:      "0 -4px 40px rgba(0,0,0,0.6)",
  handleBg:         "rgba(255,255,255,0.12)",
  closeBg:          "rgba(255,255,255,0.07)",
  closeBorder:      "rgba(255,255,255,0.10)",
  closeColor:       "rgba(255,255,255,0.5)",
  titleColor:       "#FFFFFF",
  subColor:         "#5a5a60",
  dotActive:        "#FFFFFF",
  dotInactive:      "rgba(255,255,255,0.2)",
  planBg:           "#111",
  planBorder:       "#1c1c1c",
  planActiveBg:     "#161616",
  planActiveBorder: "rgba(255,255,255,0.3)",
  planLabel:        "rgba(255,255,255,0.8)",
  planPrice:        "#FFFFFF",
  planSub:          "#444",
  planDotOff:       "#2a2a2a",
  badgeBg:          "#FFFFFF",
  badgeColor:       "#000000",
  badgeBorderColor: "#0a0a0a",
  agreeText:        "#444",
  checkboxBorder:   "#333",
  ctaBg:            "#FFFFFF",
  ctaColor:         "#000000",
  showAurora:       true,
  footnoteColor:    "#2e2e2e",
};

const LIGHT_T = {
  overlayBg:        "rgba(0,0,0,0.40)",
  sheetBg:          "#FFFFFF",
  sheetShadow:      "0 -4px 40px rgba(0,0,0,0.12)",
  handleBg:         "rgba(0,0,0,0.10)",
  closeBg:          "rgba(0,0,0,0.06)",
  closeBorder:      "rgba(0,0,0,0.08)",
  closeColor:       "rgba(0,0,0,0.4)",
  titleColor:       "#1D1D1F",
  subColor:         "#86868B",
  dotActive:        "#1D1D1F",
  dotInactive:      "rgba(0,0,0,0.15)",
  planBg:           "#F5F5F7",
  planBorder:       "#E5E5EA",
  planActiveBg:     "#FFFFFF",
  planActiveBorder: "#0071E3",
  planLabel:        "#1D1D1F",
  planPrice:        "#1D1D1F",
  planSub:          "#86868B",
  planDotOff:       "#D1D1D6",
  badgeBg:          "#1D1D1F",
  badgeColor:       "#FFFFFF",
  badgeBorderColor: "#FFFFFF",
  agreeText:        "#86868B",
  checkboxBorder:   "#C7C7CC",
  ctaBg:            "#0071E3",
  ctaColor:         "#FFFFFF",
  showAurora:       false,
  footnoteColor:    "#86868B",
};

export default function TossPaywall({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const theme  = useUIStore((s) => s.theme);
  const T      = theme === "dark" ? DARK_T : LIGHT_T;

  const [slide, setSlide]     = useState(0);
  const [plan, setPlan]       = useState<PlanId>("annual");
  const [agreed, setAgreed]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const touchX = useRef(0);

  // billing/page.tsx에서 직접 렌더링될 때는 router.back()으로 닫기
  const handleClose = () => { if (onClose) onClose(); else router.back(); };

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4200);
    return () => clearInterval(t);
  }, []);

  const handlePay = async () => {
    if (!agreed) { setError("약관 동의가 필요합니다."); return; }
    setError("");
    setLoading(true);
    try {
      const customerKey = `legal-os-${crypto.randomUUID()}`;
      const clientKey   = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const toss = await loadTossPayments(clientKey) as any;
      const payment = toss.payment({ customerKey });
      await payment.requestBillingAuth({
        method: "CARD",
        successUrl: `${window.location.origin}/billing/success?plan=${plan}&customerKey=${customerKey}`,
        failUrl:    `${window.location.origin}/billing`,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "오류가 발생했습니다.";
      if (!msg.includes("취소")) setError(msg);
      setLoading(false);
    }
  };

  return (
    <div style={{ ...S.overlay, background: T.overlayBg }}>
      <style>{KF}</style>
      <div style={{ ...S.sheet, background: T.sheetBg, boxShadow: T.sheetShadow }}>

        {/* 핸들 바 */}
        <div style={{ ...S.handle, background: T.handleBg }} />

        {/* 닫기 */}
        <button
          style={{ ...S.close, background: T.closeBg, borderColor: T.closeBorder, color: T.closeColor }}
          onClick={handleClose}
          aria-label="닫기"
        >✕</button>

        {/* 슬라이드 */}
        <div
          style={S.slideArea}
          onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={e => {
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (dx < -40) setSlide(s => (s + 1) % SLIDES.length);
            if (dx >  40) setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length);
          }}
        >
          <div key={`v-${slide}`} style={S.visual}>{SLIDES[slide].visual}</div>
          <p style={{ ...S.slideTitle, color: T.titleColor }}>{SLIDES[slide].title}</p>
          <p style={{ ...S.slideSub, color: T.subColor }}>{SLIDES[slide].sub}</p>
        </div>

        {/* 인디케이터 */}
        <div style={S.dots}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{
              ...S.dot,
              width:      i === slide ? 18 : 7,
              background: i === slide ? T.dotActive : T.dotInactive,
            }} />
          ))}
        </div>

        {/* 요금제 */}
        <div style={S.plans}>
          {PLANS.map(p => (
            <button key={p.id} onClick={() => setPlan(p.id)} style={{
              ...S.planCard,
              background: plan === p.id ? T.planActiveBg  : T.planBg,
              border:     `1.5px solid ${plan === p.id ? T.planActiveBorder : T.planBorder}`,
            }}>
              {p.badge && (
                <span style={{ ...S.badge, background: T.badgeBg, color: T.badgeColor, borderColor: T.badgeBorderColor }}>
                  {p.badge}
                </span>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ ...S.planDot, background: plan === p.id ? "#34C759" : T.planDotOff }} />
                <span style={{ ...S.planLabel, color: T.planLabel }}>{p.label}</span>
              </div>
              <span style={{ ...S.planPrice, color: T.planPrice }}>{p.price}</span>
              <span style={{ ...S.planSub, color: T.planSub }}>{p.sub}</span>
            </button>
          ))}
        </div>

        {/* 에러 */}
        {error && <p style={S.errorMsg}>⚠ {error}</p>}

        {/* 약관 */}
        <label style={S.agreeRow}>
          <div
            style={{ ...S.checkbox, background: agreed ? "#34C759" : "transparent", borderColor: agreed ? "#34C759" : T.checkboxBorder }}
            onClick={() => setAgreed(v => !v)}
          >
            {agreed && <span style={{ color: "#000", fontSize: 11, fontWeight: 900, lineHeight: 1 }}>✓</span>}
          </div>
          <span style={{ ...S.agreeText, color: T.agreeText }}>[필수] 서비스 이용약관 및 개인정보처리방침에 동의합니다.</span>
        </label>

        {/* CTA — 다크: 흰버튼+오로라글로우 / 라이트: Apple Blue 솔리드 */}
        <div style={S.ctaWrap}>
          {T.showAurora && <div style={S.aurora} />}
          <button
            onClick={handlePay}
            disabled={loading}
            style={{ ...S.cta, background: T.ctaBg, color: T.ctaColor, ...(loading ? { opacity: 0.65 } : {}) }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
            onMouseUp={e   => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
          >
            {loading
              ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <span style={{ width:16, height:16, border:`2px solid ${T.ctaColor}30`, borderTop:`2px solid ${T.ctaColor}`, borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }} />
                  처리 중...
                </span>
              : "계속하기"
            }
          </button>
        </div>

        <p style={{ ...S.footnote, color: T.footnoteColor }}>개인정보 방침 &nbsp;|&nbsp; 이용약관 &nbsp;·&nbsp; 언제든지 취소할 수 있습니다.</p>
      </div>
    </div>
  );
}

/* ══ 슬라이드 비주얼 — 다크 고정 (미니 카드 자체는 항상 다크) ══ */
function VisaVisual() {
  return (
    <div style={{ ...C.card, background: "linear-gradient(140deg,#0c1528,#162040)" }}>
      <div style={{ fontSize: 10, color: "#6B8CFF", fontWeight: 700, letterSpacing: 3, marginBottom: 8 }}>VISA TRACKER</div>
      <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>D-87</div>
      <div style={{ height: 4, background: "#1e2a40", borderRadius: 3, margin: "10px 0 5px" }}>
        <div style={{ height: "100%", width: "67%", background: "linear-gradient(90deg,#5B7FFF,#A78BFA)", borderRadius: 3 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: "#3a4a6a" }}>현재 67pt</span>
        <span style={{ fontSize: 10, color: "#6B8CFF" }}>목표 100pt</span>
      </div>
    </div>
  );
}
function WageVisual() {
  return (
    <div style={{ ...C.card, background: "linear-gradient(140deg,#071510,#0d2418)" }}>
      <div style={{ fontSize: 10, color: "#30D158", fontWeight: 700, letterSpacing: 3, marginBottom: 6 }}>WAGE LOG · 3월</div>
      <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>₩2,340,000</div>
      <div style={{ fontSize: 11, color: "#FF453A", margin: "6px 0 10px" }}>⚠ 체불 위험 3일 감지됨</div>
      <div style={{ display: "flex", gap: 3 }}>
        {[80,100,60,100,100,75,0,100,90,100,85,95].map((v,i) =>
          <div key={i} style={{ flex:1, height:22, background: v>0 ? `rgba(48,209,88,${v/110})` : "#111", borderRadius:2 }} />
        )}
      </div>
    </div>
  );
}
function HomeVisual() {
  return (
    <div style={{ ...C.card, background: "linear-gradient(140deg,#160808,#280e0e)" }}>
      <div style={{ fontSize: 10, color: "#FF453A", fontWeight: 700, letterSpacing: 3, marginBottom: 8 }}>SAFE-HOME AI</div>
      <div style={{ padding: "8px 10px", background: "rgba(255,69,58,0.1)", borderRadius: 8, border: "1px solid rgba(255,69,58,0.2)", marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: "#FF6B6B", marginBottom: 4 }}>⚠ 독소 조항 2건 발견</div>
        <div style={{ fontSize: 10, color: "#666", lineHeight: 1.6 }}>"임대인 동의 없이 전대 불가"<br />"특약 우선 적용" → 확인 필요</div>
      </div>
      <div style={{ fontSize: 10, color: "#30D158" }}>✓ 전입신고 조항 정상</div>
    </div>
  );
}
function FaxVisual() {
  return (
    <div style={{ ...C.card, background: "linear-gradient(140deg,#060c18,#0c1428)" }}>
      <div style={{ fontSize: 10, color: "#0A84FF", fontWeight: 700, letterSpacing: 3, marginBottom: 8 }}>이사 신고 자동화</div>
      <div style={{ fontSize: 12, color: "#aaa", marginBottom: 10 }}>서울 중구 → 마포구</div>
      <div style={{ padding: "7px 10px", background: "rgba(10,132,255,0.08)", borderRadius: 8, border: "1px solid rgba(10,132,255,0.2)" }}>
        <div style={{ fontSize: 11, color: "#0A84FF" }}>📠 서울출입국 팩스 전송 완료</div>
        <div style={{ fontSize: 10, color: "#444", marginTop: 3 }}>2025-03-07 14:32:01</div>
      </div>
      <div style={{ marginTop: 8, fontSize: 10, color: "#30D158" }}>과태료 ₩1,000,000 방어 완료</div>
    </div>
  );
}
function NhisVisual() {
  return (
    <div style={{ ...C.card, background: "linear-gradient(140deg,#041208,#072012)" }}>
      <div style={{ fontSize: 10, color: "#30D158", fontWeight: 700, letterSpacing: 3, marginBottom: 10 }}>건보료 절감 계산기</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#444", marginBottom: 3 }}>현재</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#FF453A", letterSpacing: -1 }}>₩152,000</div>
        </div>
        <div style={{ fontSize: 18, color: "#2a2a2a" }}>→</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#444", marginBottom: 3 }}>등록 후</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#30D158", letterSpacing: -1 }}>₩73,000</div>
        </div>
      </div>
      <div style={{ marginTop: 10, padding: "5px 10px", background: "rgba(48,209,88,0.08)", borderRadius: 6, textAlign: "center", border: "1px solid rgba(48,209,88,0.15)" }}>
        <span style={{ fontSize: 11, color: "#30D158", fontWeight: 700 }}>연 ₩948,000 절감</span>
      </div>
    </div>
  );
}

const C = {
  card: { width: "100%", maxWidth: 290, borderRadius: 14, padding: "14px 16px", textAlign: "left" as const, boxShadow: "0 16px 40px rgba(0,0,0,0.7)" },
};

/* ── 구조/레이아웃 전용 — 색상값 없음 ── */
const S: Record<string, React.CSSProperties> = {
  overlay:    { position: "fixed", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(14px)" },
  sheet:      { position: "relative", width: "100%", maxWidth: 430, borderRadius: "24px 24px 0 0", padding: "0 20px", fontFamily: `"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif`, animation: "sheetUp 420ms cubic-bezier(0.32,0.72,0,1) forwards" },
  handle:     { width: 36, height: 4, borderRadius: 2, margin: "12px auto 4px" },
  close:      { position: "absolute", top: 16, right: 16, width: 28, height: 28, borderRadius: "50%", border: "1px solid", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", transition: "all 100ms linear" },
  slideArea:  { textAlign: "center", paddingTop: 14, minHeight: 234 },
  visual:     { display: "flex", justifyContent: "center", marginBottom: 14, animation: "fadeSlide 280ms ease forwards" },
  slideTitle: { fontSize: 22, fontWeight: 700, margin: "0 0 6px", letterSpacing: -0.6 },
  slideSub:   { fontSize: 14, lineHeight: 1.65, margin: 0, whiteSpace: "pre-line" },
  dots:       { display: "flex", justifyContent: "center", gap: 5, margin: "12px 0 16px" },
  dot:        { height: 7, borderRadius: 4, border: "none", cursor: "pointer", padding: 0, transition: "all 350ms cubic-bezier(0.34,1.56,0.64,1)" },
  plans:      { display: "flex", gap: 12, marginBottom: 12 },
  planCard:   { flex: 1, position: "relative", padding: "16px 14px 14px", borderRadius: 16, cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-start", transition: "border-color 180ms, background 180ms" },
  badge:      { position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 9999, border: "2px solid", whiteSpace: "nowrap", letterSpacing: 0.3 },
  planDot:    { width: 8, height: 8, borderRadius: "50%", display: "inline-block", transition: "background 200ms" },
  planLabel:  { fontSize: 13, fontWeight: 600 },
  planPrice:  { fontSize: 20, fontWeight: 800, letterSpacing: -0.5 },
  planSub:    { fontSize: 11 },
  errorMsg:   { fontSize: 12, color: "#FF453A", margin: "0 0 10px", padding: "7px 10px", background: "rgba(255,69,58,0.08)", borderRadius: 8, border: "1px solid rgba(255,69,58,0.15)" },
  agreeRow:   { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14, cursor: "pointer" },
  checkbox:   { width: 20, height: 20, borderRadius: 6, border: "1.5px solid", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 200ms", marginTop: 1 },
  agreeText:  { fontSize: 12, lineHeight: 1.55 },
  ctaWrap:    { position: "relative", paddingBottom: 6 },
  cta:        { width: "100%", height: 56, borderRadius: 9999, fontSize: 17, fontWeight: 700, border: "none", cursor: "pointer", position: "relative", zIndex: 2, transition: "transform 100ms linear", letterSpacing: -0.3 },
  aurora:     { position: "absolute", bottom: 2, left: "8%", right: "8%", height: 34, background: "linear-gradient(90deg, #00C7FF 0%, #BF5AF2 33%, #FF375F 66%, #30D158 100%)", borderRadius: "50%", filter: "blur(22px)", zIndex: 1, animation: "auroraGlow 4s ease-in-out infinite", opacity: 0.8 },
  footnote:   { fontSize: 11, textAlign: "center", padding: "12px 0 34px", lineHeight: 1.6 },
};

const KF = `
@keyframes sheetUp {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes fadeSlide {
  from { opacity: 0; transform: translateX(10px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes auroraGlow {
  0%,100% { opacity: 0.7; transform: scaleX(0.95); }
  50%      { opacity: 1;  transform: scaleX(1.06); }
}
@keyframes spin { to { transform: rotate(360deg); } }
`;