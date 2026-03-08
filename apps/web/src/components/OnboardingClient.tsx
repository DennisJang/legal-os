"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";

/* ─── 디자인 토큰 ─────────────────────────────────────────────────── */
const C = {
  bg:      "#000000",
  white:   "#FFFFFF",
  gray:    "#A1A1A6",
  dimGray: "#3A3A3C",
  btnBg:   "#F2F2F7",
  btnTxt:  "#000000",
  blue:    "#0071E3",
  font:    `"SF Pro Display", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif`,
};

/* ─── 다국어 인사 (한국 거주 외국인 Top 30 기준) ─────────────────── */
const GREETINGS = [
  // 기존 11개국
  { text: "안녕하세요", color: "#FF9F0A" },  // 한국
  { text: "你好",        color: "#30D158" },  // 중국
  { text: "こんにちは",  color: "#0A84FF" },  // 일본
  { text: "မင်္ဂလာပါ",  color: "#BF5AF2" },  // 미얀마
  { text: "Xin chào",   color: "#FF6B6B" },  // 베트남
  { text: "สวัสดี",     color: "#FFD60A" },  // 태국
  { text: "Halo",       color: "#64D2FF" },  // 인도네시아
  { text: "Kumusta",    color: "#FF9F0A" },  // 필리핀
  { text: "Hello",      color: "#30D158" },  // 미국
  { text: "Hola",       color: "#FF453A" },  // 스페인
  { text: "नमस्ते",    color: "#FFD60A" },  // 인도
  // 추가 19개국 (한국 거주 외국인 多 순)
  { text: "Привет",     color: "#FF9F0A" },  // 러시아 (CIS계)
  { text: "Nǐ hǎo",    color: "#30D158" },  // 대만
  { text: "مرحبا",      color: "#64D2FF" },  // 우즈베키스탄 (아랍계)
  { text: "Сәлем",     color: "#BF5AF2" },  // 카자흐스탄
  { text: "Салам",     color: "#FF6B6B" },  // 키르기스스탄
  { text: "Привіт",    color: "#FFD60A" },  // 우크라이나
  { text: "Bonjour",   color: "#0A84FF" },  // 프랑스
  { text: "Hallo",     color: "#FF9F0A" },  // 독일
  { text: "Ciao",      color: "#30D158" },  // 이탈리아
  { text: "Olá",       color: "#FF453A" },  // 브라질 (포르투갈어)
  { text: "Merhaba",   color: "#FFD60A" },  // 터키
  { text: "سلام",      color: "#64D2FF" },  // 이란
  { text: "Kamusta",   color: "#BF5AF2" },  // 필리핀(세부아노)
  { text: "Sawubona",  color: "#FF6B6B" },  // 남아프리카
  { text: "Héllo",     color: "#0A84FF" },  // 나이지리아
  { text: "Mingalaba", color: "#FF9F0A" },  // 미얀마(영어식)
  { text: "Chào",      color: "#30D158" },  // 베트남(간략)
  { text: "Halló",     color: "#FF453A" },  // 몽골
  { text: "Sain uu",   color: "#FFD60A" },  // 몽골(공식)
];

/* ─── 에스컬레이터 벨트 ──────────────────────────────────────────
   position: fixed, 9개 레인을 -30deg 기울여 빼곡히 채움.
   레인 간격 ~10%씩, 모바일 뷰포트 전체를 덮도록.
*/
const LANES = [
  { top:  "0%",  dur: 22, delay:  "0s"   },
  { top:  "8%",  dur: 29, delay: "-6s"   },
  { top: "16%",  dur: 19, delay: "-13s"  },
  { top: "24%",  dur: 25, delay: "-3s"   },
  { top: "32%",  dur: 21, delay: "-18s"  },
  { top: "40%",  dur: 27, delay: "-9s"   },
  { top: "48%",  dur: 18, delay: "-15s"  },
  { top: "56%",  dur: 24, delay: "-4s"   },
  { top: "64%",  dur: 20, delay: "-11s"  },
  { top: "72%",  dur: 23, delay: "-7s"   },
  { top: "80%",  dur: 17, delay: "-16s"  },
  { top: "88%",  dur: 26, delay: "-2s"   },
  { top: "96%",  dur: 21, delay: "-12s"  },
];

// 벨트 아이템: 충분히 길게 3배 복제
const BELT_ITEMS = [...GREETINGS, ...GREETINGS, ...GREETINGS];

function EscalatorBelt() {
  return (
    <>
      <style>{`
        @keyframes scroll-belt {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>

      {/* fixed로 뷰포트 전체를 덮은 뒤 -30deg 회전 */}
      <div style={{
        position: "fixed",
        inset: "-60% -40%",          /* 회전 시 빈 모서리 없도록 충분히 확장 */
        zIndex: 0,
        pointerEvents: "none",
        transform: "rotate(-30deg)",
        transformOrigin: "center center",
        overflow: "hidden",
      }}>
        {LANES.map((lane, li) => (
          <div
            key={li}
            style={{
              position: "absolute",
              top: lane.top,
              left: 0,
              width: "300%",         /* 3배 길이 — seamless loop */
              display: "flex",
              alignItems: "center",
              gap: "20px",
              animation: `scroll-belt ${lane.dur}s linear infinite`,
              animationDelay: lane.delay,
            }}
          >
            {BELT_ITEMS.map((g, i) => (
              <span
                key={i}
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: g.color,
                  opacity: 0.55,
                  whiteSpace: "nowrap",
                  fontFamily: C.font,
                  letterSpacing: "0.01em",
                  flexShrink: 0,
                }}
              >
                {g.text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── Apple 곡선 미니멀 하우스 SVG ───────────────────────────────
   - 지붕: 더 완만한 각도(넓고 낮은 삼각형)
   - 모든 꺾임에 strokeLinejoin="round" + large strokeLinecap
   - 지붕 끝 = 벽 상단 모서리 완전 flush
   - 문: 반원 아치형, 부드러운 라운드
   - Squircle 감각 = 선이 두껍고 끝처리가 둥글어 포근함
*/
function HouseIcon({ size = 48, color = "#FFFFFF" }: { size?: number; color?: string }) {
  const sw = size * 0.072;   // strokeWidth — 두껍고 포근하게

  // 전체 캔버스: size x size
  // 지붕 꼭짓점: 상단 중앙 (약간 아래)
  const apex = { x: size * 0.5,  y: size * 0.10 };
  // 벽 상단 좌우 (지붕 끝과 동일)
  const wLeft  = size * 0.10;
  const wRight = size * 0.90;
  const wTop   = size * 0.46;   // 지붕을 낮고 넓게 — 사다리꼴 느낌
  const wBot   = size * 0.92;
  const r      = size * 0.08;   // 벽 하단 모서리 라운딩

  // 지붕 path (꼭짓점 → 우측 → 좌측, flush)
  const roofPath = `M ${apex.x} ${apex.y} L ${wRight} ${wTop} L ${wLeft} ${wTop} Z`;

  // 벽 path (rounded bottom corners)
  const wallPath = `
    M ${wLeft}  ${wTop}
    L ${wRight} ${wTop}
    L ${wRight} ${wBot - r}
    Q ${wRight} ${wBot} ${wRight - r} ${wBot}
    L ${wLeft  + r} ${wBot}
    Q ${wLeft}  ${wBot} ${wLeft} ${wBot - r}
    Z
  `;

  // 문: 중앙, 반원 아치
  const dw = size * 0.26;
  const dh = size * 0.30;
  const dx = size * 0.5 - dw / 2;
  const dy = wBot - dh;
  const doorPath = `
    M ${dx} ${wBot}
    L ${dx} ${dy + dw / 2}
    A ${dw / 2} ${dw / 2} 0 0 1 ${dx + dw} ${dy + dw / 2}
    L ${dx + dw} ${wBot}
  `;

  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      style={{ display: "block" }}
    >
      {/* 지붕 */}
      <path
        d={roofPath}
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* 벽 */}
      <path
        d={wallPath}
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* 문 */}
      <path
        d={doorPath}
        stroke={color}
        strokeWidth={sw * 0.85}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/* ─── SafeHome®Pro 워드마크 ─────────────────────────────────────── */
function SafeHomeLogo({ size = 42 }: { size?: number }) {
  const badgeSize = Math.round(size * 0.36);
  const badgeBorder = Math.max(1.2, size * 0.038);
  return (
    <div style={{ display: "inline-flex", alignItems: "flex-start" }}>
      <span style={{
        fontSize: size, fontWeight: 900, color: C.white,
        letterSpacing: "-0.04em", lineHeight: 1,
        fontFamily: C.font,
      }}>SafeHome</span>
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: badgeSize, height: badgeSize,
        borderRadius: "50%",
        border: `${badgeBorder}px solid rgba(255,255,255,0.65)`,
        fontSize: Math.round(size * 0.16),
        fontWeight: 700,
        color: "rgba(255,255,255,0.65)",
        letterSpacing: "0em",
        lineHeight: 1,
        marginLeft: Math.round(size * 0.04),
        marginTop: Math.round(size * 0.05),
        fontFamily: C.font,
        flexShrink: 0,
      }}>Pro</span>
    </div>
  );
}

/* ─── 슬라이드 데이터 ────────────────────────────────────────────── */
const SLIDES = [
  {
    type: "text" as const,
    lines: [{ text: "대한민국에\n오신 것을\n환영합니다. 👋", size: 40, weight: 800, color: C.white, glow: false }],
    sub: null as string | null,
    cta: "안녕하세요!",
    glow: "rgba(255,255,255,0.04)",
    showEscalator: true,
  },
  {
    type: "text" as const,
    lines: [{ text: "한국어로 쓰인\n서류 앞에서\n막막하십니까?", size: 38, weight: 800, color: C.white, glow: false }],
    sub: "비자, 계약서, 건강보험… 혼자 감당하기엔\n너무 복잡하고, 실수 한 번에 100만 원 과태료." as string | null,
    cta: "네, 항상 그랬습니다",
    glow: "rgba(255,59,48,0.10)",
    showEscalator: false,
  },
  {
    type: "text" as const,
    lines: [
      { text: "해결책이\n있습니다:", size: 28, weight: 500, color: C.gray, glow: false },
      { text: "SAFEHOME_LOGO", size: 48, weight: 900, color: C.white, glow: true },
    ],
    sub: "외국인의 한국 체류를\n법적으로 완전 자동화하는 시스템." as string | null,
    cta: "어떻게 작동하나요?",
    glow: "rgba(0,113,227,0.15)",
    showEscalator: false,
  },
  { type: "stats" as const, cta: "더 알아보기",   glow: "rgba(48,209,88,0.10)",   showEscalator: false },
  { type: "orbit" as const, headline: "당신 혼자\n감당해야 했던\n것들:", cta: "이제 클릭 한 번으로", glow: "rgba(255,159,10,0.10)", showEscalator: false },
  { type: "login" as const,                        glow: "rgba(191,90,242,0.12)",  showEscalator: false },
];

/* ─── 공통 버튼 ───────────────────────────────────────────────────── */
function Btn({ label, onClick, visible }: { label: string; onClick?: () => void; visible: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", height: 56, borderRadius: 9999,
        background: C.btnBg, color: C.btnTxt,
        fontSize: 17, fontWeight: 700, border: "none",
        cursor: "pointer", fontFamily: C.font, letterSpacing: "-0.022em",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 400ms 200ms ease, transform 400ms 200ms cubic-bezier(0.32,0.72,0,1)",
      }}
      onMouseDown={e => Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(0.97)", opacity: "0.8" })}
      onMouseUp={e => Object.assign((e.currentTarget as HTMLElement).style, { transform: "translateY(0) scale(1)", opacity: "1" })}
    >{label}</button>
  );
}

/* ─── 이전 슬라이드 잔상 ─────────────────────────────────────────── */
function GhostText({ lines, sub }: { lines: Array<{ text: string; size: number; weight: number }>; sub: string | null }) {
  return (
    <div style={{ marginBottom: 40, opacity: 0.14, filter: "blur(2.5px)", pointerEvents: "none" }}>
      {lines.map((l, i) => (
        <p key={i} style={{
          fontSize: Math.max(l.size * 0.50, 15), fontWeight: l.weight, color: C.white,
          letterSpacing: "-0.04em", lineHeight: 1.2, whiteSpace: "pre-line", marginBottom: 4,
        }}>{l.text === "SAFEHOME_LOGO" ? "SafeHome" : l.text}</p>
      ))}
      {sub && <p style={{ fontSize: 12, color: C.gray, lineHeight: 1.5, whiteSpace: "pre-line", marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

/* ─── 텍스트 슬라이드 ─────────────────────────────────────────────── */
function TextSlide({ slide, onNext }: { slide: typeof SLIDES[0] & { type: "text" }; onNext: () => void }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    setPhase(0);
    const t1 = setTimeout(() => setPhase(1), 80);
    const t2 = setTimeout(() => setPhase(2), 500);
    const t3 = setTimeout(() => setPhase(3), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 40, position: "relative", zIndex: 1 }}>
      <div style={{ marginBottom: 28 }}>
        {slide.lines.map((l, i) => {
          const isLogo = l.text === "SAFEHOME_LOGO";
          return (
            <div key={i} style={{
              marginBottom: i < slide.lines.length - 1 ? 10 : 0,
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1 ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 600ms ${i * 100}ms ease, transform 600ms ${i * 100}ms cubic-bezier(0.32,0.72,0,1)`,
              ...(l.glow && !isLogo ? { filter: "drop-shadow(0 0 20px rgba(255,255,255,0.35))" } : {}),
            }}>
              {isLogo
                ? <SafeHomeLogo size={l.size} />
                : <p style={{
                    fontSize: l.size, fontWeight: l.weight, color: l.color,
                    letterSpacing: l.size >= 40 ? "-0.05em" : "-0.02em",
                    lineHeight: 1.15, whiteSpace: "pre-line", margin: 0,
                  }}>{l.text}</p>
              }
            </div>
          );
        })}
      </div>
      {slide.sub && (
        <p style={{
          fontSize: 16, color: C.gray, lineHeight: 1.75, letterSpacing: "-0.01em",
          whiteSpace: "pre-line", marginBottom: 40,
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "translateY(0)" : "translateY(14px)",
          transition: "opacity 500ms 100ms ease, transform 500ms 100ms cubic-bezier(0.32,0.72,0,1)",
        }}>{slide.sub}</p>
      )}
      <Btn label={slide.cta} onClick={onNext} visible={phase >= 3} />
    </div>
  );
}

/* ─── 수치 카드 슬라이드 ─────────────────────────────────────────── */
const STATS = [
  { icon: "💸", color: "#FF9F0A", label: "과태료 100만 원\n이사 후 14일 신고 누락 시" },
  { icon: "📉", color: "#30D158", label: "임금 체불 피해\n외국인 노동자 매년 증가" },
  { icon: "🏠", color: "#0A84FF", label: "전세 사기 피해\n외국인 비율 매년 증가" },
  { icon: "📋", color: "#BF5AF2", label: "비자 조건 미달 귀국\n연간 수천 건" },
];

function StatsSlide({ onNext }: { onNext: () => void }) {
  const [vis, setVis] = useState(0);
  useEffect(() => {
    const ts = STATS.map((_, i) => setTimeout(() => setVis(i + 1), i * 160 + 100));
    return () => ts.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 40, position: "relative", zIndex: 1 }}>
      {/* SafeHome Pro 타이틀 */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginBottom: 24,
        opacity: vis >= 1 ? 1 : 0, transition: "opacity 500ms ease",
      }}>
        <SafeHomeLogo size={22} />
        <span style={{ fontSize: 22, fontWeight: 700, color: C.white, letterSpacing: "-0.02em" }}>와 함께라면:</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 14,
            background: "rgba(255,255,255,0.06)",
            border: `1px solid ${s.color}44`, borderRadius: 18, padding: "14px 18px",
            opacity: vis > i ? 1 : 0,
            transform: vis > i ? "translateY(0) scale(1)" : "translateY(16px) scale(0.96)",
            transition: `opacity 500ms ${i * 80}ms ease, transform 500ms ${i * 80}ms cubic-bezier(0.32,0.72,0,1)`,
          }}>
            <div style={{
              width: 46, height: 46, borderRadius: 13, flexShrink: 0,
              background: `${s.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            }}>{s.icon}</div>
            <p style={{ fontSize: 13, color: C.white, lineHeight: 1.55, whiteSpace: "pre-line" }}>{s.label}</p>
          </div>
        ))}
      </div>
      <Btn label="더 알아보기" onClick={onNext} visible={vis >= STATS.length} />
    </div>
  );
}

/* ─── 원형 회전 슬라이드 ─────────────────────────────────────────── */
const ORBIT_ICONS = ["✈️", "📠", "💰", "🏠", "💊", "📄", "🔑", "🏢"];
const R_ORBIT = 112;

function OrbitSlide({ slide, onNext }: { slide: { headline: string; cta: string }; onNext: () => void }) {
  const [angle, setAngle] = useState(0);
  const [phase, setPhase] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setPhase(true);
    let last = 0;
    const tick = (now: number) => {
      if (!last) last = now;
      setAngle(a => (a + (now - last) * 0.018) % 360);
      last = now;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{
        fontSize: 34, fontWeight: 800, color: C.white,
        letterSpacing: "-0.05em", lineHeight: 1.2, whiteSpace: "pre-line", marginBottom: 24,
        opacity: phase ? 1 : 0, transform: phase ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 600ms ease, transform 600ms cubic-bezier(0.32,0.72,0,1)",
      }}>{slide.headline}</p>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{
          position: "absolute",
          width: R_ORBIT * 2 + 64, height: R_ORBIT * 2 + 64,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "radial-gradient(circle, rgba(28,28,28,0.6) 52%, transparent 70%)",
        }} />
        {/* 중앙 — Apple 곡선 하우스 */}
        <div style={{
          width: 86, height: 86, borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          border: "1.5px solid rgba(255,255,255,0.16)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2,
          boxShadow: "0 0 28px rgba(255,159,10,0.28), 0 0 56px rgba(255,159,10,0.10)",
        }}>
          <HouseIcon size={44} color={C.white} />
        </div>

        {ORBIT_ICONS.map((icon, i) => {
          const rad = (angle + i * (360 / ORBIT_ICONS.length)) * (Math.PI / 180);
          return (
            <div key={i} style={{
              position: "absolute", left: "50%", top: "50%",
              width: 52, height: 52,
              transform: `translate(calc(${Math.cos(rad) * R_ORBIT}px - 50%), calc(${Math.sin(rad) * R_ORBIT}px - 50%))`,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.14)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            }}>{icon}</div>
          );
        })}
      </div>

      <div style={{ paddingBottom: 40 }}>
        <Btn label={slide.cta} onClick={onNext} visible={phase} />
      </div>
    </div>
  );
}

/* ─── 로그인 슬라이드 ─────────────────────────────────────────────── */
function LoginSlide() {
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(false);
  useEffect(() => { const t = setTimeout(() => setPhase(true), 200); return () => clearTimeout(t); }, []);

  const handleGoogle = async () => {
    setLoading(true);
    const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 48, position: "relative", zIndex: 1 }}>
      <div style={{
        textAlign: "center", marginBottom: 52,
        opacity: phase ? 1 : 0,
        transform: phase ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 700ms ease, transform 700ms cubic-bezier(0.32,0.72,0,1)",
      }}>
        {/* 아이콘 컨테이너 */}
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 84, height: 84, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          border: "1.5px solid rgba(255,255,255,0.16)",
          marginBottom: 22,
          boxShadow: "0 0 40px rgba(191,90,242,0.38), 0 0 72px rgba(0,113,227,0.18)",
        }}>
          <HouseIcon size={42} color={C.white} />
        </div>

        {/* SafeHome Pro 로고 */}
        <div style={{ marginBottom: 14 }}>
          <SafeHomeLogo size={38} />
        </div>
        <p style={{ fontSize: 15, color: C.gray, lineHeight: 1.65 }}>
          200만 외국인의 한국 생활을<br />법적으로 완전 자동화합니다
        </p>
      </div>

      <div style={{
        opacity: phase ? 1 : 0,
        transform: phase ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 700ms 150ms ease, transform 700ms 150ms cubic-bezier(0.32,0.72,0,1)",
      }}>
        <button
          onClick={handleGoogle} disabled={loading}
          style={{
            width: "100%", height: 56, borderRadius: 9999,
            background: C.btnBg, color: C.btnTxt,
            fontSize: 17, fontWeight: 700, border: "none",
            cursor: "pointer", fontFamily: C.font,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "transform 100ms linear, opacity 100ms linear",
            opacity: loading ? 0.6 : 1,
          }}
          onMouseDown={e => Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(0.97)", opacity: "0.8" })}
          onMouseUp={e => Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(1)", opacity: "1" })}
        >
          {loading ? <span style={{ color: C.gray }}>연결 중...</span> : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google로 시작하기
            </>
          )}
        </button>
        <p style={{ fontSize: 12, color: C.dimGray, textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
          가입 시 서비스 이용약관 및 개인정보처리방침에 동의합니다
        </p>
      </div>
    </div>
  );
}

/* ─── 진행 인디케이터 ─────────────────────────────────────────────── */
function Dots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: "flex", gap: 5, justifyContent: "center", paddingBottom: 28 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          height: 3, borderRadius: 99,
          width: i === current ? 22 : 5,
          background: i === current ? C.white : "rgba(255,255,255,0.22)",
          transition: "width 300ms cubic-bezier(0.32,0.72,0,1), background 300ms ease",
        }} />
      ))}
    </div>
  );
}

/* ─── 메인 온보딩 ─────────────────────────────────────────────────── */
export default function OnboardingClient() {
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [prevSlide, setPrevSlide] = useState<typeof SLIDES[0] | null>(null);

  const goNext = useCallback(() => {
    setExiting(true);
    setPrevSlide(SLIDES[step]);
    setTimeout(() => { setStep(s => Math.min(s + 1, SLIDES.length - 1)); setExiting(false); }, 220);
  }, [step]);

  const slide = SLIDES[step];

  return (
    <main style={{
      background: C.bg, minHeight: "100dvh",
      display: "flex", flexDirection: "column",
      fontFamily: C.font, overflow: "hidden", position: "relative",
    }}>
      {/* 배경 글로우 */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `radial-gradient(ellipse 70% 45% at 50% 85%, ${(slide as any).glow} 0%, transparent 70%)`,
        transition: "background 800ms ease",
      }} />

      {/* 에스컬레이터 벨트 — step 0 전용, zIndex 0 */}
      {step === 0 && !exiting && <EscalatorBelt />}

      {/* 콘텐츠 래퍼 */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        maxWidth: 430, width: "100%", margin: "0 auto",
        padding: "0 24px", paddingTop: 64,
        position: "relative", zIndex: 1,
        opacity: exiting ? 0 : 1,
        transform: exiting ? "translateY(-8px)" : "translateY(0)",
        transition: "opacity 200ms ease, transform 200ms ease",
      }}>
        {/* 이전 슬라이드 잔상 */}
        {!exiting && prevSlide && prevSlide.type === "text" && (
          <GhostText lines={prevSlide.lines} sub={prevSlide.sub} />
        )}

        {slide.type === "text"  && <TextSlide  slide={slide}  onNext={goNext} key={step} />}
        {slide.type === "stats" && <StatsSlide                onNext={goNext} key={step} />}
        {slide.type === "orbit" && <OrbitSlide slide={slide}  onNext={goNext} key={step} />}
        {slide.type === "login" && <LoginSlide                               key={step} />}
      </div>

      {/* 진행 인디케이터 */}
      {step < SLIDES.length - 1 && (
        <div style={{ position: "relative", zIndex: 1 }}>
          <Dots total={SLIDES.length - 1} current={step} />
        </div>
      )}
    </main>
  );
}