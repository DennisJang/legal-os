"use client";
import { useEffect, useRef, useState } from "react";
import { loadPaymentWidget, PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";

const SF = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif`;

export default function TossPaywall() {
  const paymentWidgetRef        = useRef<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef = useRef<unknown>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const clientKey   = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
      const customerKey = `customer_${Date.now()}`;
      const widget = await loadPaymentWidget(clientKey, customerKey);
      paymentMethodsWidgetRef.current = widget.renderPaymentMethods(
        "#payment-widget", { value: 4900 }, { variantKey: "DEFAULT" }
      );
      widget.renderAgreement("#agreement", { variantKey: "AGREEMENT" });
      paymentWidgetRef.current = widget;
      setIsLoaded(true);
    })();
  }, []);

  const handlePayment = async () => {
    try {
      await paymentWidgetRef.current?.requestPayment({
        orderId:    `order_${Date.now()}`,
        orderName:  "LEGAL-OS 구독 (월 4,900원)",
        successUrl: `${window.location.origin}/billing/success`,
        failUrl:    `${window.location.origin}/billing`,
      });
    } catch (e) {
      console.error("결제 에러:", e);
    }
  };

  return (
    <main style={{ minHeight: "100dvh", backgroundColor: "#F5F5F7", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: SF }}>
      <div style={{ width: "100%", maxWidth: 430, backgroundColor: "#FFFFFF", borderRadius: 18, padding: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1D1D1F", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 8 }}>
          LEGAL-OS 시작하기
        </h2>
        <p style={{ fontSize: 13, color: "#86868B", lineHeight: 1.5, marginBottom: 24 }}>
          월 4,900원으로 체류자격 유지와 임금 보호를 100% 자동화하세요.
        </p>

        <div id="payment-widget" style={{ marginBottom: 8 }} />
        <div id="agreement"      style={{ marginBottom: 24 }} />

        <button
          onClick={handlePayment}
          disabled={!isLoaded}
          onMouseDown={e => { if (isLoaded) Object.assign(e.currentTarget.style, { transform: "scale(0.96)", opacity: "0.8" }); }}
          onMouseUp={e =>    Object.assign(e.currentTarget.style, { transform: "scale(1)", opacity: "1" })}
          onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: "scale(1)", opacity: "1" })}
          style={{ width: "100%", height: 56, borderRadius: 14, border: "none", backgroundColor: isLoaded ? "#0071E3" : "#E5E5EA", color: isLoaded ? "#fff" : "#86868B", fontSize: 17, fontWeight: 600, letterSpacing: "-0.022em", cursor: isLoaded ? "pointer" : "not-allowed", boxShadow: "none", transition: "transform 100ms linear, opacity 100ms linear, background 200ms ease", fontFamily: SF }}
        >
          월 4,900원 구독하기
        </button>
      </div>
    </main>
  );
}