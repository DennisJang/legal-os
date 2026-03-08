"use client";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "@/store/useDashboardStore";
import WageCalendarWidget from "@/components/widgets/WageCalendarWidget";

const T = {
  bg: "#F5F5F7", surface: "#FFFFFF", primary: "#1D1D1F",
  secondary: "#86868B", blue: "#0071E3", green: "#34C759",
  amber: "#FF9500", red: "#FF3B30",
  font: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif`,
};

const css = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  .press { transition: transform 100ms linear, opacity 100ms linear; cursor: pointer; }
  .press:active { transform: scale(0.96); opacity: 0.8; }
`;

const StatCard = ({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) => (
  <div style={{ background: T.surface, borderRadius: 14, padding: "14px 16px", flex: 1 }}>
    <p style={{ fontSize: 12, color: T.secondary, letterSpacing: "-0.01em", marginBottom: 4 }}>{label}</p>
    <p style={{ fontSize: 20, fontWeight: 700, color, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>
    {sub && <p style={{ fontSize: 11, color: T.secondary, marginTop: 4 }}>{sub}</p>}
  </div>
);

export default function WagePage() {
  const router = useRouter();
  const { monthlyWage, markedDates } = useDashboardStore();

  const totalPay    = monthlyWage?.total_pay      ?? 0;
  const basePay     = monthlyWage?.base_pay       ?? 0;
  const overtimePay = monthlyWage?.overtime_pay   ?? 0;
  const nightPay    = monthlyWage?.night_bonus_pay ?? 0;
  const workedDays  = markedDates.size;
  const isUnderpaid = totalPay > 0 && totalPay < 2_060_740;

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
          <p style={{ fontSize: 13, color: T.secondary, letterSpacing: "-0.01em", marginBottom: 2 }}>스마트 임금 트래커</p>
          <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.04em", color: T.primary, lineHeight: 1.1 }}>
            임금 달력
          </h1>
        </div>
      </header>

      <div style={{ maxWidth: 430, margin: "0 auto", paddingInline: 20, paddingTop: 24 }}>

        {/* 체불 경고 배너 */}
        {isUnderpaid && (
          <div style={{
            background: `${T.red}12`, borderRadius: 14, padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
            borderLeft: `3px solid ${T.red}`,
            animation: "fadeSlideUp 380ms cubic-bezier(0.32,0.72,0,1) forwards",
          }}>
            <span style={{ fontSize: 22 }}>⚠️</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: T.red, letterSpacing: "-0.022em" }}>최저임금 미달 가능성</p>
              <p style={{ fontSize: 12, color: T.secondary, marginTop: 2 }}>
                이번 달 예상 급여가 최저임금(₩2,060,740)보다 낮습니다.
              </p>
            </div>
          </div>
        )}

        {/* 요약 스탯 3개 */}
        <div style={{
          display: "flex", gap: 8, marginBottom: 16,
          animation: "fadeSlideUp 380ms 40ms cubic-bezier(0.32,0.72,0,1) both",
        }}>
          <StatCard label="이번 달 예상" value={`₩${(totalPay / 10000).toFixed(0)}만`} sub="세전 기준" color={isUnderpaid ? T.red : T.green} />
          <StatCard label="출근일"       value={`${workedDays}일`}                       sub="기록 완료" color={T.blue}  />
          <StatCard label="초과근무"     value={`₩${(overtimePay / 10000).toFixed(0)}만`} sub="야간 포함" color={T.amber} />
        </div>

        {/* 달력 위젯 — 로직 동결 */}
        <div style={{ marginBottom: 16, animation: "fadeSlideUp 380ms 80ms cubic-bezier(0.32,0.72,0,1) both" }}>
          <WageCalendarWidget />
        </div>

        {/* 급여 상세 내역 */}
        <div style={{
          background: T.surface, borderRadius: 18, overflow: "hidden", marginBottom: 16,
          animation: "fadeSlideUp 380ms 120ms cubic-bezier(0.32,0.72,0,1) both",
        }}>
          <div style={{ padding: "16px 20px 8px" }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: T.primary, letterSpacing: "-0.022em" }}>급여 상세 내역</h2>
          </div>
          {[
            { label: "기본급",   value: basePay,     color: T.primary  },
            { label: "초과근무", value: overtimePay, color: T.amber    },
            { label: "야간수당", value: nightPay,    color: "#5E5CE6"  },
          ].map((item, i) => (
            <div key={item.label}>
              {i > 0 && <div style={{ height: 0.5, background: "#F2F2F7", marginLeft: 20 }} />}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px" }}>
                <span style={{ fontSize: 15, color: T.secondary, letterSpacing: "-0.022em" }}>{item.label}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: item.color, letterSpacing: "-0.022em" }}>
                  ₩{item.value.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
          {/* 합계 */}
          <div style={{ margin: "0 16px 16px", background: T.bg, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: T.primary, letterSpacing: "-0.022em" }}>합계</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: isUnderpaid ? T.red : T.green, letterSpacing: "-0.04em" }}>
                ₩{totalPay.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ animation: "fadeSlideUp 380ms 160ms cubic-bezier(0.32,0.72,0,1) both" }}>
          <button
            className="press"
            // ✅ 패치: window.location.href → router.push()
            onClick={() => router.push(`/dashboard/fax?type=${isUnderpaid ? "wage" : "wage"}`)}
            style={{
              width: "100%", height: 56, borderRadius: 14, border: "none",
              background: isUnderpaid ? T.red : T.blue,
              color: "white", fontSize: 17, fontWeight: 600,
              cursor: "pointer", fontFamily: T.font, letterSpacing: "-0.022em",
              transition: "background 200ms ease",
            }}
          >
            {isUnderpaid ? "⚖️ 임금 체불 진정서 발급" : "📋 급여 명세서 PDF 생성"}
          </button>
        </div>
      </div>
    </main>
  );
}