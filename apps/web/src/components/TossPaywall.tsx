"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";

/* ══════════════════════════════════════════
   LEGAL-OS Premium Paywall v2
   순검정 + 시스템 강조색 + 오로라 CTA
   플랜: 월간 ₩4,900 / 연간 ₩24,000
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

export default function TossPaywall({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
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
      // SDK v2: payment({ customerKey }) 후 requestBillingAuth
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
    <div style={S.overlay}>
      <style>{KF}</style>
      <div style={S.sheet}>

        {/* 핸들 바 */}
        <div style={S.handle} />

        {/* 닫기 */}
        <button style={S.close} onClick={handleClose} aria-label="닫기">✕</button>

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
          <p style={S.slideTitle}>{SLIDES[slide].title}</p>
          <p style={S.slideSub}>{SLIDES[slide].sub}</p>
        </div>

        {/* 인디케이터 */}
        <div style={S.dots}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{
              ...S.dot,
              width:      i === slide ? 18 : 7,
              background: i === slide ? "#fff" : "rgba(255,255,255,0.2)",
            }} />
          ))}
        </div>

        {/* 요금제 */}
        <div style={S.plans}>
          {PLANS.map(p => (
            <button key={p.id} onClick={() => setPlan(p.id)} style={{
              ...S.planCard,
              ...(plan === p.id ? S.planActive : {}),
            }}>
              {p.badge && <span style={S.badge}>{p.badge}</span>}
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ ...S.planDot, background: plan === p.id ? "#34C759" : "#2a2a2a" }} />
                <span style={S.planLabel}>{p.label}</span>
              </div>
              <span style={S.planPrice}>{p.price}</span>
              <span style={S.planSub}>{p.sub}</span>
            </button>
          ))}
        </div>

        {/* 에러 */}
        {error && <p style={S.errorMsg}>⚠ {error}</p>}

        {/* 약관 */}
        <label style={S.agreeRow}>
          <div
            style={{ ...S.checkbox, background: agreed ? "#34C759" : "transparent", borderColor: agreed ? "#34C759" : "#333" }}
            onClick={() => setAgreed(v => !v)}
          >
            {agreed && <span style={{ color: "#000", fontSize: 11, fontWeight: 900, lineHeight: 1 }}>✓</span>}
          </div>
          <span style={S.agreeText}>[필수] 서비스 이용약관 및 개인정보처리방침에 동의합니다.</span>
        </label>

        {/* CTA */}
        <div style={S.ctaWrap}>
          <div style={S.aurora} />
          <button
            onClick={handlePay}
            disabled={loading}
            style={{ ...S.cta, ...(loading ? { opacity: 0.65 } : {}) }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
            onMouseUp={e   => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
          >
            {loading
              ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <span style={{ width:16, height:16, border:"2px solid #00000030", borderTop:"2px solid #000", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }} />
                  처리 중...
                </span>
              : "계속하기"
            }
          </button>
        </div>

        <p style={S.footnote}>개인정보 방침 &nbsp;|&nbsp; 이용약관 &nbsp;·&nbsp; 언제든지 취소할 수 있습니다.</p>
      </div>
    </div>
  );
}

/* ══ 슬라이드 비주얼 컴포넌트 ══ */
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

const S: Record<string, React.CSSProperties> = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(14px)" },
  sheet: { position: "relative", width: "100%", maxWidth: 430, background: "#0a0a0a", borderRadius: "24px 24px 0 0", padding: "0 20px", fontFamily: `"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif`, color: "#fff", animation: "sheetUp 420ms cubic-bezier(0.32,0.72,0,1) forwards", boxShadow: "0 -4px 40px rgba(0,0,0,0.6)" },
  handle: { width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)", margin: "12px auto 4px" },
  close: { position: "absolute", top: 16, right: 16, width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", transition: "all 100ms linear" },
  slideArea: { textAlign: "center", paddingTop: 14, minHeight: 234 },
  visual: { display: "flex", justifyContent: "center", marginBottom: 14, animation: "fadeSlide 280ms ease forwards" },
  slideTitle: { fontSize: 22, fontWeight: 700, margin: "0 0 6px", letterSpacing: -0.6 },
  slideSub: { fontSize: 14, color: "#5a5a60", lineHeight: 1.65, margin: 0, whiteSpace: "pre-line" },
  dots: { display: "flex", justifyContent: "center", gap: 5, margin: "12px 0 16px" },
  dot: { height: 7, borderRadius: 4, border: "none", cursor: "pointer", padding: 0, transition: "all 350ms cubic-bezier(0.34,1.56,0.64,1)" },
  plans: { display: "flex", gap: 12, marginBottom: 12 },
  planCard: { flex: 1, position: "relative", padding: "16px 14px 14px", borderRadius: 16, border: "1.5px solid #1c1c1c", background: "#111", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-start", transition: "border-color 180ms, background 180ms" },
  planActive: { border: "1.5px solid rgba(255,255,255,0.3)", background: "#161616" },
  badge: { position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "#fff", color: "#000", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 9999, border: "2px solid #0a0a0a", whiteSpace: "nowrap", letterSpacing: 0.3 },
  planDot: { width: 8, height: 8, borderRadius: "50%", display: "inline-block", transition: "background 200ms" },
  planLabel: { fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" },
  planPrice: { fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.5 },
  planSub: { fontSize: 11, color: "#444" },
  errorMsg: { fontSize: 12, color: "#FF453A", margin: "0 0 10px", padding: "7px 10px", background: "rgba(255,69,58,0.08)", borderRadius: 8, border: "1px solid rgba(255,69,58,0.15)" },
  agreeRow: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14, cursor: "pointer" },
  checkbox: { width: 20, height: 20, borderRadius: 6, border: "1.5px solid", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 200ms", marginTop: 1 },
  agreeText: { fontSize: 12, color: "#444", lineHeight: 1.55 },
  ctaWrap: { position: "relative", paddingBottom: 6 },
  cta: { width: "100%", height: 56, borderRadius: 9999, background: "#fff", color: "#000", fontSize: 17, fontWeight: 700, border: "none", cursor: "pointer", position: "relative", zIndex: 2, transition: "transform 100ms linear", letterSpacing: -0.3 },
  aurora: { position: "absolute", bottom: 2, left: "8%", right: "8%", height: 34, background: "linear-gradient(90deg, #00C7FF 0%, #BF5AF2 33%, #FF375F 66%, #30D158 100%)", borderRadius: "50%", filter: "blur(22px)", zIndex: 1, animation: "auroraGlow 4s ease-in-out infinite", opacity: 0.8 },
  footnote: { fontSize: 11, color: "#2e2e2e", textAlign: "center", padding: "12px 0 34px", lineHeight: 1.6 },
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