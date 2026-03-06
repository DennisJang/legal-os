'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  isOpen:    boolean;
  onClose:   () => void;
  onConfirm: () => void;
}

const SF = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif`;

export default function LiabilityActionSheet({ isOpen, onClose, onConfirm }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [agreed,    setAgreed]    = useState(false);

  useEffect(() => { setIsMounted(true); return () => setIsMounted(false); }, []);
  useEffect(() => { if (!isOpen) setAgreed(false); }, [isOpen]);

  if (!isMounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "flex-end",
        background: "rgba(0,0,0,0.40)",
        backdropFilter: "blur(4px) saturate(120%)",
        WebkitBackdropFilter: "blur(4px) saturate(120%)",
        transition: "opacity 300ms ease",
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        fontFamily: SF,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 430, margin: "0 auto",
          borderRadius: "28px 28px 0 0",
          padding: 20,
          paddingBottom: "max(env(safe-area-inset-bottom), 40px)",
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 400ms cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          backgroundColor: "#E5E5EA", margin: "0 auto 20px",
        }} />

        <h2 style={{
          fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em",
          color: "#1D1D1F", marginBottom: 8,
        }}>
          최종 확인 및 법적 책임 동의
        </h2>
        <p style={{
          fontSize: 13, color: "#86868B", lineHeight: 1.5, marginBottom: 24,
          letterSpacing: "-0.01em",
        }}>
          본 서비스는 문서 자동 완성 도구일 뿐 법률 대리를 수행하지 않습니다.
          최종 제출된 정보의 진위 여부 및 반려, 과태료 발생에 대한 모든 법적 책임은
          사용자 본인에게 있습니다.
        </p>

        {/* iOS 토글 — 로직 동결 */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 24,
        }}>
          <span style={{ fontSize: 17, fontWeight: 400, letterSpacing: "-0.022em", color: "#1D1D1F" }}>
            위 내용에 동의합니다
          </span>
          <button
            onClick={() => setAgreed(v => !v)}
            style={{
              position: "relative", width: 51, height: 31, borderRadius: 9999,
              border: "none", flexShrink: 0, cursor: "pointer",
              background: agreed ? "#34C759" : "#E5E5EA",
              transition: "background 250ms cubic-bezier(0.25,0.1,0.25,1)",
            }}
          >
            <span style={{
              position: "absolute", top: 2, left: 2,
              width: 27, height: 27, borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
              transform: agreed ? "translateX(20px)" : "translateX(0)",
              transition: "transform 250ms cubic-bezier(0.25,0.1,0.25,1)",
              display: "block",
            }} />
          </button>
        </div>

        {/* CTA — 로직 동결 */}
        <button
          onClick={() => { if (!agreed) return; onConfirm(); }}
          style={{
            width: "100%", height: 56, borderRadius: 14, border: "none",
            backgroundColor: "#0071E3", color: "#FFFFFF",
            fontSize: 17, fontWeight: 600, letterSpacing: "-0.022em",
            cursor: agreed ? "pointer" : "default",
            boxShadow: "none",
            opacity: agreed ? 1 : 0.5,
            pointerEvents: agreed ? "auto" : "none",
            transition: "transform 100ms linear, opacity 100ms linear",
            fontFamily: SF,
          }}
          onMouseDown={e => Object.assign(e.currentTarget.style, { transform: "scale(0.96)", opacity: "0.8" })}
          onMouseUp={e =>    Object.assign(e.currentTarget.style, { transform: "scale(1)",    opacity: agreed ? "1" : "0.5" })}
          onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: "scale(1)",    opacity: agreed ? "1" : "0.5" })}
        >
          동의하고 팩스 발송
        </button>
      </div>
    </div>,
    document.body
  );
}