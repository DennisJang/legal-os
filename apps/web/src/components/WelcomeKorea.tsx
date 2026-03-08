"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const FONT = `"SF Pro Display", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif`;

// 로컬 이미지 — apps/web/public/korea-night.jpg 에 저장
// NASA Black Marble 다운로드:
// https://eoimages.gsfc.nasa.gov/images/imagerecords/144000/144898/korea_vir_2021_lrg.jpg
const KOREA_NIGHT = "/korea-night.jpg";

export default function WelcomeKorea({ onEnter }: { onEnter?: () => void }) {
  const router = useRouter();
  const [phase, setPhase]       = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    // 로컬 이미지 — 즉시 로드
    setImgLoaded(true);

    const ts = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1100),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 2400),
      setTimeout(() => setPhase(5), 3100),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  const show = (active: boolean, delay = "0ms"): React.CSSProperties => ({
    opacity: active ? 1 : 0,
    transform: active ? "translateY(0px)" : "translateY(22px)",
    transition: `opacity 800ms ${delay} cubic-bezier(0.25,0.1,0.25,1),
                 transform 800ms ${delay} cubic-bezier(0.25,0.1,0.25,1)`,
  });

  return (
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", justifyContent: "center",
      background: "#000",
    }}>
      <main style={{
        position: "relative",
        width: "100%", maxWidth: 430, height: "100%",
        overflow: "hidden",
        fontFamily: FONT,
        background: "#020810",
      }}>

        {/* ── 야경 위성사진 배경 ── */}
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: imgLoaded && phase >= 1 ? 1 : 0,
          transition: "opacity 1600ms ease",
        }}>
          <img
            src={KOREA_NIGHT}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 35%",
              // 야경 느낌 강화: 도시 불빛 황금색 살리기
              filter: "brightness(1.1) saturate(1.4) contrast(1.1)",
              // 시네마틱 줌인 — 14초 동안 1.0 → 1.08
              transform: phase >= 1 ? "scale(1.08)" : "scale(1.0)",
              transition: "transform 14s cubic-bezier(0.25,0.1,0.25,1)",
            }}
          />
        </div>

        {/* ── 우주 느낌 상단 글로우 ── */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "40%",
          background: "radial-gradient(ellipse 100% 80% at 50% 0%, rgba(0,20,60,0.85) 0%, transparent 100%)",
          pointerEvents: "none",
        }} />

        {/* ── 하단 안개 — 텍스트 가독성 ── */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "65%",
          background: `linear-gradient(to top,
            rgba(2,5,12,1.0)  0%,
            rgba(2,5,12,0.98) 22%,
            rgba(2,5,12,0.92) 36%,
            rgba(2,5,12,0.70) 50%,
            rgba(2,5,12,0.30) 64%,
            transparent       100%)`,
          pointerEvents: "none",
        }} />

        {/* ── 텍스트 + 버튼 ── */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "0 28px 52px",
          display: "flex", flexDirection: "column",
        }}>

          <p style={{
            fontSize: 11, fontWeight: 600,
            color: "rgba(120,180,255,0.60)",
            letterSpacing: "0.18em", textTransform: "uppercase",
            marginBottom: 14,
            ...show(phase >= 2),
          }}>
            Land of the Morning Calm
          </p>

          <h1 style={{
            fontSize: 36, fontWeight: 800, color: "#FFFFFF",
            letterSpacing: "-0.045em", lineHeight: 1.18,
            marginBottom: 18,
            ...show(phase >= 3),
          }}>
            고요한 새벽의<br />나라에 오신 걸<br />환영합니다.
          </h1>

          <p style={{
            fontSize: 15, fontWeight: 400,
            color: "rgba(255,255,255,0.52)",
            letterSpacing: "-0.015em", lineHeight: 1.80,
            marginBottom: 40,
            ...show(phase >= 4, "100ms"),
          }}>
            머나먼 타국에서 이 땅에 온 당신,<br />
            낯선 서류와 언어 앞에서 혼자<br />
            싸워온 그 시간을 압니다.<br />
            <span style={{ color: "rgba(160,210,255,0.75)", fontWeight: 500 }}>
              이제는 함께 합니다.
            </span>
          </p>

          <button
            onClick={() => onEnter ? onEnter() : router.push("/dashboard")}
            style={{
              width: "100%", height: 56, borderRadius: 9999,
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              color: "#000000", fontSize: 17, fontWeight: 700,
              border: "none", cursor: "pointer",
              fontFamily: FONT, letterSpacing: "-0.022em",
              transition: "transform 100ms linear, opacity 100ms linear",
              ...show(phase >= 5),
            }}
            onMouseDown={e => Object.assign((e.currentTarget as HTMLElement).style,
              { transform: "scale(0.97)", opacity: "0.8" })}
            onMouseUp={e => Object.assign((e.currentTarget as HTMLElement).style,
              { transform: "scale(1)", opacity: "1" })}
          >
            시작하기
          </button>
        </div>
      </main>
    </div>
  );
}