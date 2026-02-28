"use client";
import { useEffect, useState, useRef } from "react";

const ACTIONS = [
  { icon: "🛂", label: "내 비자 점수 갱신", href: "/dashboard" },
  { icon: "💰", label: "오늘 출퇴근 기록",   href: "/dashboard" },
  { icon: "🏠", label: "계약서 AI 스캔",     href: "/safe-home" },
  { icon: "📠", label: "팩스 발송",           href: "/fax" },
  { icon: "💳", label: "구독 관리",           href: "/billing" },
];

export default function MagicPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen((v) => !v); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => { if (open) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);

  const filtered = ACTIONS.filter((a) => a.label.includes(query));

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="fixed bottom-8 right-8 w-[56px] h-[56px] rounded-full bg-white text-[#0A0A0A] text-[24px]
                 flex items-center justify-center shadow-[0_0_32px_rgba(255,255,255,0.2)] hover:scale-110 transition-transform duration-75 z-50">
      ⌘
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40"
         onClick={() => setOpen(false)}>
      <div onClick={(e) => e.stopPropagation()}
           className="w-[480px] rounded-[24px] bg-[#111]/90 border border-white/20 overflow-hidden shadow-[0_0_64px_rgba(255,255,255,0.08)]">
        <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="검색하거나 명령어를 입력하세요..."
          className="w-full bg-transparent px-[24px] py-[20px] text-[16px] outline-none border-b border-white/10 placeholder:text-white/30" />
        <ul className="py-[8px]">
          {filtered.map((a) => (
            <li key={a.label}>
              <a href={a.href} onClick={() => setOpen(false)}
                 className="flex items-center gap-[16px] px-[24px] py-[14px] hover:bg-white/5 transition-colors">
                <span className="text-[20px]">{a.icon}</span>
                <span className="text-[14px] font-medium">{a.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="px-[24px] py-[12px] border-t border-white/10">
          <span className="text-[11px] text-white/30">ESC 닫기 · ⌘K 토글</span>
        </div>
      </div>
    </div>
  );
}
