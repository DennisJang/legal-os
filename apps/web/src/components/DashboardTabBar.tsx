"use client";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";

const T = {
  blue:      "#0071E3",
  secondary: "#86868B",
  font:      `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif`,
};

const TABS = [
  { id: "home", icon: "⊕", label: "홈",    href: "/dashboard" },
  { id: "visa", icon: "◎", label: "비자",   href: "/dashboard/visa" },
  { id: "wage", icon: "◈", label: "임금",   href: "/dashboard/wage" },
  { id: "fax",  icon: "◆", label: "팩스",   href: "/dashboard/fax" },
  { id: "me",   icon: "◉", label: "내 정보", href: "/dashboard/me" },
];

const css = `
  .tab-bar {
    position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
    width: 100%; max-width: 430px;
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-top: 0.5px solid rgba(0,0,0,0.08);
    padding: 8px 0 16px; z-index: 100;
  }
  .tab-btn {
    display: flex; flex-direction: column; align-items: center; gap: 4;
    background: none; border: none; cursor: pointer; padding: 8px 12px;
    transition: color 200ms ease; -webkit-tap-highlight-color: transparent;
  }
  .tab-icon {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 10px;
    transition: transform 100ms linear, background 200ms ease;
  }
  .tab-btn:active .tab-icon {
    transform: scale(0.82);
    background: rgba(0,113,227,0.12);
  }

  /* 페이지 진입 spring 애니메이션 */
  @keyframes pageEnter {
    from { opacity: 0; transform: translateY(18px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)     scale(1);    }
  }
  .page-enter {
    animation: pageEnter 380ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
  }
`;

export default function DashboardTabBar() {
  const pathname = usePathname();
  const router   = useRouter();
  const prev     = useRef(pathname);

  const navigate = (href: string) => {
    if (href === pathname) return;
    prev.current = pathname;
    // 페이지 컨테이너에 spring 클래스 주입
    const main = document.querySelector("main");
    if (main) {
      main.classList.remove("page-enter");
      // reflow 강제 → 애니메이션 재실행
      void (main as HTMLElement).offsetHeight;
      main.classList.add("page-enter");
    }
    router.push(href);
  };

  return (
    <>
      <style>{css}</style>
      <nav className="tab-bar">
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {TABS.map(t => {
            // /dashboard → home, /dashboard/visa → visa
            const isActive = t.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(t.href);
            return (
              <button
                key={t.id}
                className="tab-btn"
                onClick={() => navigate(t.href)}
                style={{ color: isActive ? T.blue : T.secondary, fontFamily: T.font }}
              >
                <div className="tab-icon">
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{t.icon}</span>
                </div>
                <span style={{
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 400,
                  letterSpacing: "-0.01em",
                  transition: "font-weight 200ms ease",
                }}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}