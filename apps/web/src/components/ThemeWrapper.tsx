"use client";
import { useUIStore } from "@/store/useUIStore";

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((s) => s.theme);
  return (
    <div data-theme={theme} style={{ minHeight: "100dvh", background: "var(--bg-base)", transition: "background 300ms ease" }}>
      {children}
    </div>
  );
}