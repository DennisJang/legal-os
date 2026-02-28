"use client";
import VisaRingWidget from "@/components/widgets/VisaRingWidget";
import WageCalendarWidget from "@/components/widgets/WageCalendarWidget";
import SafeHomeWidget from "@/components/widgets/SafeHomeWidget";
import MagicPalette from "@/components/MagicPalette";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white font-mono">
      <div className="max-w-[1200px] mx-auto px-[32px] py-[48px]">
        <header className="flex items-center justify-between mb-[48px]">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight">LEGAL-OS</h1>
            <p className="text-[14px] text-white/40 mt-[4px]">한국 거주 외국인 행정 자동화</p>
          </div>
          <div className="flex items-center gap-[8px] text-[12px] text-white/40 border border-white/10 rounded-[12px] px-[16px] py-[8px]">
            <span>⌘K</span><span>매직 팔레트</span>
          </div>
        </header>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
          <VisaRingWidget />
          <WageCalendarWidget />
          <SafeHomeWidget />
        </section>
        <section className="mt-[32px] grid grid-cols-2 md:grid-cols-4 gap-[16px]">
          {[
            { emoji: "📠", label: "팩스 발송", href: "/fax" },
            { emoji: "📄", label: "PDF 생성",  href: "/docs" },
            { emoji: "💳", label: "구독 관리", href: "/billing" },
            { emoji: "⚙️", label: "내 정보",   href: "/profile" },
          ].map(({ emoji, label, href }) => (
            <a key={label} href={href}
               className="flex items-center gap-[12px] rounded-[16px] border border-white/10 px-[16px] py-[16px]
                          hover:bg-white/5 hover:border-white/20 active:scale-[0.98] transition-all duration-75">
              <span className="text-[24px]">{emoji}</span>
              <span className="text-[14px] font-medium">{label}</span>
            </a>
          ))}
        </section>
      </div>
      <MagicPalette />
    </main>
  );
}
