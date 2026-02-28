"use client";
import VisaRingWidget from "@/components/widgets/VisaRingWidget";
import WageCalendarWidget from "@/components/widgets/WageCalendarWidget";
import SafeHomeWidget from "@/components/widgets/SafeHomeWidget";
import MagicPalette from "@/components/MagicPalette";

export default function DashboardPage() {
  return (
    <main style={{ backgroundColor:"#0A0A0A", minHeight:"100vh", color:"#fff", fontFamily:"monospace" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"48px 32px" }}>
        <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:48 }}>
          <div>
            <h1 style={{ fontSize:32, fontWeight:900, letterSpacing:"-0.5px", margin:0 }}>LEGAL-OS</h1>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", marginTop:4 }}>한국 거주 외국인 행정 자동화</p>
          </div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.1)",
                        borderRadius:12, padding:"8px 16px" }}>
            ⌘K 매직 팔레트
          </div>
        </header>

        <section style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
          <VisaRingWidget />
          <WageCalendarWidget />
          <SafeHomeWidget />
        </section>

        <section style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginTop:32 }}>
          {[
            { emoji:"📠", label:"팩스 발송",  href:"/fax" },
            { emoji:"📄", label:"PDF 생성",   href:"/docs" },
            { emoji:"💳", label:"구독 관리",  href:"/billing" },
            { emoji:"⚙️", label:"내 정보",    href:"/profile" },
          ].map(({ emoji, label, href }) => (
            <a key={label} href={href} style={{
              display:"flex", alignItems:"center", gap:12,
              border:"1px solid rgba(255,255,255,0.1)", borderRadius:16,
              padding:16, color:"#fff", textDecoration:"none"
            }}>
              <span style={{ fontSize:24 }}>{emoji}</span>
              <span style={{ fontSize:14, fontWeight:600 }}>{label}</span>
            </a>
          ))}
        </section>
      </div>
      <MagicPalette />
    </main>
  );
}
