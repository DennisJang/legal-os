"use client";
import { useEffect, useRef, useState } from "react";
import { loadPaymentWidget, PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import GoogleAuthButton from "@/components/GoogleAuthButton";

export default function TossPaywall() {
  const paymentWidgetRef         = useRef<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef  = useRef<any>(null);
  const [isLoaded, setIsLoaded]  = useState(false);

  useEffect(() => {
    (async () => {
      const clientKey  = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
      const customerKey = "generate-random-or-use-uid";
      const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
      const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
        "#payment-widget", { value: 4900 }, { variantKey: "DEFAULT" }
      );
      paymentWidget.renderAgreement("#agreement", { variantKey: "AGREEMENT" });
      paymentWidgetRef.current         = paymentWidget;
      paymentMethodsWidgetRef.current  = paymentMethodsWidget;
      setIsLoaded(true);
    })();
  }, []);

  const handlePayment = async () => {
    try {
      await paymentWidgetRef.current?.requestPayment({
        orderId:   `order_${Date.now()}`,
        orderName: "LEGAL-OS 구독 (월 4,900원)",
        successUrl: `${window.location.origin}/dashboard`,
        failUrl:    `${window.location.origin}/`,
      });
    } catch (error) {
      console.error("결제 에러:", error);
    }
  };

  return (
    <div style={{
      width: "100%", backgroundColor: "#FFFFFF",
      borderRadius: 18, padding: 20, overflow: "hidden",
      /* 헌법: box-shadow 옅고 넓게만 허용 */
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
    }}>
      {/* 타이틀 */}
      <h2 style={{
        fontSize: 24, fontWeight: 700, color: "#1D1D1F",
        letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 8,
        fontFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`,
      }}>
        LEGAL-OS 시작하기
      </h2>
      <p style={{
        fontSize: 13, color: "#86868B", lineHeight: 1.5, marginBottom: 24,
        fontFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`,
      }}>
        월 4,900원으로 체류자격 유지와 임금 보호를 100% 자동화하세요.
      </p>

      {/* Google 로그인 */}
      <div style={{ marginBottom: 24 }}>
        <GoogleAuthButton />
      </div>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 0.5, backgroundColor: "#E5E5EA" }} />
        <span style={{
          fontSize: 13, color: "#86868B",
          fontFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`,
        }}>
          또는 카드로 결제하기
        </span>
        <div style={{ flex: 1, height: 0.5, backgroundColor: "#E5E5EA" }} />
      </div>

      {/* Toss 위젯 — 로직 동결 */}
      <div id="payment-widget" style={{ marginBottom: 8 }} />
      <div id="agreement"      style={{ marginBottom: 24 }} />

      {/* CTA */}
      <button
        onClick={handlePayment}
        disabled={!isLoaded}
        style={{
          width: "100%", height: 56, borderRadius: 14, border: "none",
          backgroundColor: isLoaded ? "#0071E3" : "#E5E5EA",
          color: isLoaded ? "#fff" : "#86868B",
          fontSize: 17, fontWeight: 600, letterSpacing: "-0.022em",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: isLoaded ? "pointer" : "not-allowed",
          boxShadow: "none",
          transition: "transform 100ms linear, opacity 100ms linear, background 200ms ease",
          fontFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`,
        }}
        onMouseDown={e => { if (isLoaded) Object.assign(e.currentTarget.style, { transform: "scale(0.96)", opacity: "0.8" }); }}
        onMouseUp={e =>    Object.assign(e.currentTarget.style, { transform: "scale(1)",    opacity: "1"   })}
        onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: "scale(1)",    opacity: "1"   })}
      >
        월 4,900원 구독하기
      </button>
    </div>
  );
}