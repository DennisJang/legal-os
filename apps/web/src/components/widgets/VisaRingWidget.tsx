"use client";
import { useDashboardStore } from "@/store/useDashboardStore";

export default function VisaRingWidget() {
  const { currentScore, targetScore, daysLeft, visaCode, targetVisa, updateVisaScore } =
    useDashboardStore();
  const r = 54, circ = 2 * Math.PI * r;
  const dash = circ * Math.min(currentScore / targetScore, 1);

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:24,
                  borderRadius:24, backgroundColor:"#111111", border:"1px solid rgba(255,255,255,0.1)",
                  padding:32, color:"#fff" }}>
      <div style={{ position:"relative", width:144, height:144 }}>
        <svg viewBox="0 0 144 144" style={{ transform:"rotate(-90deg)" }} width={144} height={144}>
          <circle cx={72} cy={72} r={r} fill="none" stroke="#222" strokeWidth={10} />
          <circle cx={72} cy={72} r={r} fill="none" stroke="#fff" strokeWidth={10}
            strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
            style={{ transition:"stroke-dasharray 0.7s cubic-bezier(0.4,0,0.2,1)" }} />
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
                      alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:28, fontWeight:900, lineHeight:1 }}>{currentScore}</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:4 }}>/{targetScore}점</span>
        </div>
      </div>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", letterSpacing:3, textTransform:"uppercase" }}>
          {visaCode} → {targetVisa}
        </p>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.7)", marginTop:4 }}>D-{daysLeft}</p>
      </div>
      <button onClick={() => updateVisaScore(5)} style={{
        width:"100%", padding:"14px", borderRadius:16, backgroundColor:"#fff",
        color:"#0A0A0A", fontSize:14, fontWeight:700, border:"none", cursor:"pointer", fontFamily:"inherit"
      }}>
        내 스펙 갱신하기 +5
      </button>
    </div>
  );
}
