"use client";

import { useEffect, useRef, useState } from "react";
import { loadPaymentWidget, PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import GoogleAuthButton from "@/components/GoogleAuthButton"; // 🎯 오염 소거 및 완벽한 Import

export default function TossPaywall() {
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      // ⚠️ TOSS 클라이언트 키 (환경변수 누락 시 테스트 키 작동)
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
      const customerKey = "generate-random-or-use-uid";

      const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
      const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
        "#payment-widget",
        { value: 4900 },
        { variantKey: "DEFAULT" }
      );
      paymentWidget.renderAgreement("#agreement", { variantKey: "AGREEMENT" });

      paymentWidgetRef.current = paymentWidget;
      paymentMethodsWidgetRef.current = paymentMethodsWidget;
      setIsLoaded(true);
    })();
  }, []);

  const handlePayment = async () => {
    const paymentWidget = paymentWidgetRef.current;
    try {
      await paymentWidget?.requestPayment({
        orderId: `order_${Date.now()}`,
        orderName: "LEGAL-OS 구독 (월 4,900원)",
        successUrl: `${window.location.origin}/dashboard`,
        failUrl: `${window.location.origin}/`,
      });
    } catch (error) {
      console.error("결제 에러:", error);
    }
  };

  return (
    <div className="w-full bg-[#FFFFFF] rounded-[18px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* 1. 타이틀 영역 */}
      <h2 className="text-[24px] font-semibold text-[#1D1D1F] tracking-[-0.02em] leading-[1.2] mb-2">
        LEGAL-OS 시작하기
      </h2>
      <p className="text-[13px] font-normal text-[#86868B] leading-[1.3] mb-6">
        월 4,900원으로 체류자격 유지와 임금 보호를 100% 자동화하세요.
      </p>

      {/* 2. 구글 로그인 버튼 (최상단 배치) */}
      <div className="mb-6">
        <GoogleAuthButton />
      </div>

      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="h-px bg-[#F5F5F7] flex-1"></div>
        <span className="text-[13px] text-[#86868B]">또는 카드로 결제하기</span>
        <div className="h-px bg-[#F5F5F7] flex-1"></div>
      </div>

      {/* 3. 토스 결제 위젯 */}
      <div id="payment-widget" className="mb-2" />
      <div id="agreement" className="mb-6" />

      {/* 4. 결제 액션 버튼 */}
      <button
        onClick={handlePayment}
        disabled={!isLoaded}
        className="
          w-full h-[56px] rounded-[14px]
          bg-[#0071E3] text-[#FFFFFF]
          font-semibold text-[17px]
          flex items-center justify-center
          active:scale-[0.97] active:opacity-80
          transition-all duration-100 linear
          disabled:opacity-50 disabled:active:scale-100
        "
      >
        월 4,900원 구독하기
      </button>
    </div>
  );
}