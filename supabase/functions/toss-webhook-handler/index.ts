import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const TOSS_WEBHOOK_SECRET = Deno.env.get("TOSS_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// 🛡️ Deno 내장 Web Crypto를 사용한 무결점 Toss 서명 검증 (외부 의존성 X)
async function verifyTossSignature(signatureHeader: string, rawBody: string, secret: string) {
  try {
    const parts = signatureHeader.split(',');
    const timestamp = parts.find(p => p.trim().startsWith('t='))?.split('=')[1];
    const signature = parts.find(p => p.trim().startsWith('v1='))?.split('=')[1];
    if (!timestamp || !signature) return false;

    const encoder = new TextEncoder();
    const data = encoder.encode(`${timestamp}.${rawBody}`);
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const hashBuffer = await crypto.subtle.sign('HMAC', key, data);
    const expectedSig = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

    return signature === expectedSig;
  } catch {
    return false;
  }
}

serve(async (req: Request) => {
  // 🚨 루프 단절 헌법: 에러가 나도 토스에는 무조건 200을 뱉어 무한 재시도 폭격 방어
  const ok200 = new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  if (req.method !== "POST") return ok200;

  const rawBody = await req.text();
  const signatureHeader = req.headers.get("TossPayments-Signature");

  // 1. 서명 검증 (실패 시에만 401 반환)
  if (!signatureHeader || !(await verifyTossSignature(signatureHeader, rawBody, TOSS_WEBHOOK_SECRET))) {
    console.error("[Webhook] Invalid Signature");
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  try {
    const payload = JSON.parse(rawBody);
    const { data } = payload;
    
    // 2. 🛡️ Domain A가 작성한 RPC 시그니처와 100% 매칭
    if (data?.orderId && data?.status && data?.totalAmount) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase.rpc("handle_toss_webhook", {
        p_order_id: data.orderId,
        p_status: data.status,
        p_amount: data.totalAmount,
        p_payment_key: data.paymentKey ?? null
      });
    }
  } catch (e) {
    console.error("[Webhook Error]:", e);
  }

  return ok200;
});