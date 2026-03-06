"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant     = "primary" | "pill" | "ghost" | "danger";
type Size        = "sm" | "md" | "lg";
type ColorScheme = "blue" | "green" | "red" | "amber" | "gray";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:     Variant;
  size?:        Size;
  colorScheme?: ColorScheme;
  fullWidth?:   boolean;
  loading?:     boolean;
}

const COLOR: Record<ColorScheme, { bg: string; text: string; pill: string }> = {
  blue:  { bg: "#0071E3", text: "#fff",    pill: "rgba(0,113,227,0.10)"    },
  green: { bg: "#34C759", text: "#fff",    pill: "rgba(52,199,89,0.10)"    },
  red:   { bg: "#FF3B30", text: "#fff",    pill: "rgba(255,59,48,0.10)"    },
  amber: { bg: "#FF9500", text: "#fff",    pill: "rgba(255,149,0,0.10)"    },
  gray:  { bg: "#E5E5EA", text: "#86868B", pill: "rgba(134,134,139,0.10)"  },
};

const SIZE: Record<Size, { h: string; fs: string; px: string; r: string }> = {
  sm: { h: "36px", fs: "13px", px: "0 14px", r: "10px" },
  md: { h: "44px", fs: "15px", px: "0 18px", r: "12px" },
  lg: { h: "56px", fs: "17px", px: "0 24px", r: "14px" },
};

const press = {
  onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "scale(0.96)";
    e.currentTarget.style.opacity   = "0.8";
  },
  onMouseUp: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "";
    e.currentTarget.style.opacity   = "";
  },
  onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "";
    e.currentTarget.style.opacity   = "";
  },
  onTouchStart: (e: React.TouchEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.96)";
    (e.currentTarget as HTMLButtonElement).style.opacity   = "0.8";
  },
  onTouchEnd: (e: React.TouchEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.transform = "";
    (e.currentTarget as HTMLButtonElement).style.opacity   = "";
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "lg", colorScheme = "blue",
     fullWidth = false, loading = false, disabled, children, style, ...props }, ref) => {

    const c  = COLOR[colorScheme];
    const s  = SIZE[size];
    const off = disabled || loading;

    const base: React.CSSProperties = {
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      fontFamily: `var(--font-system, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif)`,
      fontWeight: 600, fontSize: s.fs, letterSpacing: "-0.022em",
      border: "none", boxShadow: "none",
      cursor: off ? "not-allowed" : "pointer",
      userSelect: "none", WebkitUserSelect: "none" as never,
      whiteSpace: "nowrap",
      width: fullWidth ? "100%" : undefined,
      transition: "transform 100ms linear, opacity 100ms linear, background 200ms ease",
    };

    if (variant === "primary") Object.assign(base, {
      height: s.h, padding: s.px, borderRadius: s.r,
      background: off ? "#E5E5EA" : c.bg,
      color:      off ? "#86868B" : c.text,
    });

    if (variant === "pill") Object.assign(base, {
      height: "auto", padding: "8px 16px", borderRadius: "9999px",
      fontSize: "13px",
      background: off ? "rgba(134,134,139,0.10)" : c.pill,
      color:      off ? "#86868B" : c.bg,
    });

    if (variant === "ghost") Object.assign(base, {
      height: s.h, padding: s.px, borderRadius: s.r,
      background: "transparent",
      color: off ? "#86868B" : c.bg,
    });

    if (variant === "danger") Object.assign(base, {
      height: s.h, padding: s.px, borderRadius: s.r,
      background: off ? "#E5E5EA" : "#FF3B30",
      color:      off ? "#86868B" : "#fff",
    });

    return (
      <button ref={ref} disabled={off} style={{ ...base, ...style }}
        {...(off ? {} : press)} {...props}>
        {loading
          ? <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)",
              borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          : children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;