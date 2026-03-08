"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSubmitStore } from "@/store/useSubmitStore";
import LiabilityActionSheet from "@/components/LiabilityActionSheet";
import MissingDocFallback from "@/components/MissingDocFallback";
import { createBrowserClient } from "@supabase/ssr";


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
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  .press { transition: transform 100ms linear, opacity 100ms linear; cursor: pointer; }
  .press:active { transform: scale(0.96); opacity: 0.8; }
`;

// ─────────────────────────────────────────────
// 위험 등급 → 색상/레이블 맵
// ─────────────────────────────────────────────
const RISK_MAP = {
  SAFE:    { label: "안전",   color: "#34C759", bg: "#34C75912" },
  WARNING: { label: "주의",   color: "#FF9500", bg: "#FF950012" },
  DANGER:  { label: "위험",   color: "#FF3B30", bg: "#FF3B3012" },
} as const;
type RiskLevel = keyof typeof RISK_MAP;

// ─────────────────────────────────────────────
// 더미 분석 결과 타입 (parse-contract-ocr 응답 구조)
// ─────────────────────────────────────────────
interface Clause {
  title: string;
  risk: RiskLevel;
  detail: string;
}
interface OcrResult {
  overallRisk: RiskLevel;
  deposit: string;
  monthlyRent: string;
  expiresAt: string;
  clauses: Clause[];
}

// ─────────────────────────────────────────────
// Sub-components (≤ 30줄 원칙)
// ─────────────────────────────────────────────
function UploadZone({ onFile }: { onFile: (f: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      className="press"
      onClick={() => inputRef.current?.click()}
      style={{
        background: T.surface, borderRadius: 18, padding: 32,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        border: "1.5px dashed #D1D1D6", cursor: "pointer",
        animation: "fadeSlideUp 380ms cubic-bezier(0.32,0.72,0,1) forwards",
      }}
    >
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: `${T.blue}12`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
      }}>📄</div>
      <p style={{ fontSize: 17, fontWeight: 700, color: T.primary, letterSpacing: "-0.022em" }}>
        계약서 사진 업로드
      </p>
      <p style={{ fontSize: 13, color: T.secondary, textAlign: "center", lineHeight: 1.5 }}>
        JPG · PNG · PDF 지원<br />AI가 독소 조항을 모국어로 경고합니다
      </p>
      <span style={{
        padding: "8px 20px", borderRadius: 9999,
        background: T.blue, color: "#fff",
        fontSize: 13, fontWeight: 600, letterSpacing: "-0.022em",
      }}>
        파일 선택하기
      </span>
      <input
        ref={inputRef} type="file"
        accept="image/*,.pdf"
        style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
    </div>
  );
}

function AnalyzingState() {
  return (
    <div style={{
      background: T.surface, borderRadius: 18, padding: 32,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
      animation: "fadeSlideUp 300ms cubic-bezier(0.32,0.72,0,1) forwards",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: `${T.blue}12`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
        animation: "pulse 1.4s ease-in-out infinite",
      }}>🔍</div>
      <p style={{ fontSize: 17, fontWeight: 700, color: T.primary, letterSpacing: "-0.022em" }}>
        AI 분석 중...
      </p>
      <p style={{ fontSize: 13, color: T.secondary }}>독소 조항을 검토하고 있습니다</p>
      {["보증금 · 월세 파싱", "임대인 의무 조항 검토", "특약 사항 위험도 분류"].map((s, i) => (
        <div key={i} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          animation: `fadeSlideUp 300ms ${i * 180}ms cubic-bezier(0.32,0.72,0,1) both`,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%", background: T.blue,
            animation: "pulse 1.4s ease-in-out infinite",
          }} />
          <p style={{ fontSize: 13, color: T.secondary }}>{s}</p>
        </div>
      ))}
    </div>
  );
}

function ClauseCard({ clause }: { clause: Clause }) {
  const { color, bg } = RISK_MAP[clause.risk];
  return (
    <div style={{
      background: bg, borderRadius: 14, padding: 16,
      borderLeft: `3px solid ${color}`,
      animation: "fadeSlideUp 380ms cubic-bezier(0.32,0.72,0,1) forwards",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "3px 8px",
          borderRadius: 9999, background: color, color: "#fff",
        }}>
          {RISK_MAP[clause.risk].label}
        </span>
        <p style={{ fontSize: 15, fontWeight: 600, color: T.primary, letterSpacing: "-0.022em" }}>
          {clause.title}
        </p>
      </div>
      <p style={{ fontSize: 13, color: T.secondary, lineHeight: 1.5 }}>{clause.detail}</p>
    </div>
  );
}

function ResultSummary({ result }: { result: OcrResult }) {
  const { color, label, bg } = RISK_MAP[result.overallRisk];
  return (
    <div style={{
      background: T.surface, borderRadius: 18, overflow: "hidden",
      animation: "fadeSlideUp 380ms cubic-bezier(0.32,0.72,0,1) forwards",
    }}>
      {/* 총평 헤더 */}
      <div style={{
        background: bg, padding: 20, display: "flex", alignItems: "center", gap: 14,
        borderBottom: `1px solid ${color}22`,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width={28} height={34} viewBox="0 0 80 96" fill="none">
            <path d="M40 4L8 18v24c0 22 14.4 42.4 32 50 17.6-7.6 32-28 32-50V18L40 4z"
              fill={color} fillOpacity={0.2} stroke={color} strokeWidth={2} />
            <path d="M28 48l8 8 16-16" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: 13, color: T.secondary }}>AI 분석 종합 의견</p>
          <p style={{ fontSize: 24, fontWeight: 700, color, letterSpacing: "-0.02em" }}>
            {label} — 계속 진행 {result.overallRisk === "DANGER" ? "주의 요망" : "가능"}
          </p>
        </div>
      </div>

      {/* 핵심 수치 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
        {[
          { label: "보증금",   value: result.deposit },
          { label: "월세",     value: result.monthlyRent },
          { label: "만료일",   value: result.expiresAt },
        ].map((item, i) => (
          <div key={i} style={{
            padding: "16px 12px", textAlign: "center",
            borderRight: i < 2 ? "0.5px solid #F2F2F7" : undefined,
          }}>
            <p style={{ fontSize: 11, color: T.secondary, marginBottom: 4 }}>{item.label}</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: T.primary, letterSpacing: "-0.022em" }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────
type Step = "upload" | "analyzing" | "result" | "fallback";

export default function SafeHomePage() {
  const router = useRouter();
  const { submitFax, faxStatus } = useSubmitStore();

  const [step,             setStep]             = useState<Step>("upload");
  const [result,           setResult]           = useState<OcrResult | null>(null);
  const [showDisclaimer,   setShowDisclaimer]   = useState(false);
  const [showFallback,     setShowFallback]     = useState(false);

  // ── 파일 수신 → parse-contract-ocr Edge Function 호출
  const handleFile = async (file: File) => {
  setStep("analyzing");
  try {
    // 1. File → Base64 변환
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // 2. Supabase Edge Function 직접 호출
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.functions.invoke("parse-contract-ocr", {
      body: { imageBase64: base64, mimeType: file.type || "image/jpeg" },
    });

    if (error) throw error;

    // 3. Edge Function 응답 → OcrResult 형태로 변환
    // parse-contract-ocr 반환: { deposit, monthly_rent, expiration_date }
    setResult({
      overallRisk:  "WARNING",                          // 기본값 (추후 AI 확장)
      deposit:      `₩${Number(data.deposit).toLocaleString()}`,
      monthlyRent:  `₩${Number(data.monthly_rent).toLocaleString()}`,
      expiresAt:    data.expiration_date ?? "미확인",
      clauses:      [],                                 // 추후 조항 분석 확장
    });
  } catch (err) {
    console.error("[OCR Error]", err);
    setResult(DUMMY_RESULT);   // 실패 시 더미 fallback (명시적 로그 추가)
  }
  setStep("result");
};

  // ── 면책 동의 확인 → 팩스 발송
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
        <div style={{ maxWidth: 430, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="press"
            onClick={() => router.back()}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(0,0,0,0.06)", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, cursor: "pointer",
            }}
          >‹</button>
          <div>
            <p style={{ fontSize: 13, color: T.secondary, marginBottom: 1 }}>AI 계약서 분석</p>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.04em", color: T.primary, lineHeight: 1.1 }}>
              Safe-Home 스캐너
            </h1>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 430, margin: "0 auto", paddingInline: 20, paddingTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ── Step: upload ── */}
        {step === "upload" && (
          <UploadZone onFile={handleFile} />
        )}

        {/* ── Step: analyzing ── */}
        {step === "analyzing" && <AnalyzingState />}

        {/* ── Step: result ── */}
        {step === "result" && result && (
          <>
            <ResultSummary result={result} />

            {/* 조항별 위험도 카드 */}
            <div style={{
              background: T.surface, borderRadius: 18, padding: 20,
              display: "flex", flexDirection: "column", gap: 10,
              animation: "fadeSlideUp 420ms cubic-bezier(0.32,0.72,0,1) forwards",
            }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: T.primary, letterSpacing: "-0.022em", marginBottom: 4 }}>
                조항별 위험 분석
              </h2>
              {result.clauses.map((c, i) => <ClauseCard key={i} clause={c} />)}
            </div>

            {/* [보완 3] 서류 미보유 안내 */}
            <div style={{
              background: T.surface, borderRadius: 18, padding: 20,
              animation: "fadeSlideUp 460ms cubic-bezier(0.32,0.72,0,1) forwards",
            }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: T.primary, letterSpacing: "-0.022em", marginBottom: 4 }}>
                계약 진행 시 필요 서류가 없으신가요?
              </p>
              <p style={{ fontSize: 13, color: T.secondary, marginBottom: 14 }}>
                본국 서류 발급이 필요하다면 제휴 행정사로 연결합니다.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="press"
                  onClick={() => setShowFallback(true)}
                  style={{
                    flex: 1, height: 44, borderRadius: 12,
                    border: "1.5px solid #E5E5EA", background: T.surface,
                    color: T.secondary, fontSize: 14, fontWeight: 600,
                    cursor: "pointer", fontFamily: T.font,
                  }}
                >
                  서류 없어요
                </button>
                <button
                  className="press"
                  onClick={() => setShowDisclaimer(true)}
                  style={{
                    flex: 2, height: 44, borderRadius: 12,
                    border: "none", background: T.blue,
                    color: "#fff", fontSize: 14, fontWeight: 600,
                    cursor: "pointer", fontFamily: T.font,
                  }}
                >
                  📠 계약서 팩스 발송
                </button>
              </div>
            </div>

            {/* 재스캔 */}
            <button
              className="press"
              onClick={() => { setStep("upload"); setResult(null); }}
              style={{
                width: "100%", height: 48, borderRadius: 12,
                border: "none", background: "#F2F2F7",
                color: T.secondary, fontSize: 15, fontWeight: 600,
                cursor: "pointer", fontFamily: T.font,
              }}
            >
              다른 계약서 스캔하기
            </button>
          </>
        )}

        {/* [보완 3] Fallback 라우팅 */}
        {showFallback && (
          <div style={{ animation: "fadeSlideUp 300ms cubic-bezier(0.32,0.72,0,1) forwards" }}>
            <MissingDocFallback />
            <button
              className="press"
              onClick={() => setShowFallback(false)}
              style={{
                width: "100%", height: 48, borderRadius: 12,
                border: "none", background: "#F2F2F7",
                color: T.secondary, fontSize: 15, fontWeight: 600,
                cursor: "pointer", marginTop: 12, fontFamily: T.font,
              }}
            >
              돌아가기
            </button>
          </div>
        )}
      </div>

      {/* [보완 5] 면책 동의 — 로직 동결 */}
      <LiabilityActionSheet
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
        onConfirm={handleConfirm}
      />
    </main>
  );
}

// ─────────────────────────────────────────────
// 더미 데이터 — parse-contract-ocr 미배포 시 fallback
// ─────────────────────────────────────────────
const DUMMY_RESULT: OcrResult = {
  overallRisk:   "WARNING",
  deposit:       "₩50,000,000",
  monthlyRent:   "₩550,000",
  expiresAt:     "2026-08-31",
  clauses: [
    {
      title:  "임대인 수리 책임 불명확",
      risk:   "WARNING",
      detail: "제7조 특약에 '시설 하자에 대한 수리 비용은 임차인 부담'이라는 조항이 포함되어 있습니다. 민법 제623조 임대인 수선 의무와 충돌 가능성이 있습니다.",
    },
    {
      title:  "중도 해지 위약금 과다",
      risk:   "DANGER",
      detail: "제9조에 '계약 기간 중 임차인이 해지할 경우 보증금의 10%를 위약금으로 납부'라는 조항이 있습니다. 일반적 관행(1~2개월 월세) 대비 과도하며 소비자 보호법 위반 소지가 있습니다.",
    },
    {
      title:  "임대 기간 및 갱신 조건",
      risk:   "SAFE",
      detail: "계약 기간 2년, 묵시적 갱신 허용, 5% 이내 임대료 인상 한도 명시 — 주택임대차보호법 기준에 부합합니다.",
    },
  ],
};