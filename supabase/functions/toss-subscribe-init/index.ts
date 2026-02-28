// supabase/functions/toss-subscribe-init/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TOSS_BASE = "https://api.tosspayments.com";

function tossAuthHeader(): string {
  const secret = Deno.env.get("TOSS_SECRET_KEY") ?? "";
  return "Basic " + btoa(secret + ":");
}

serve(async (req) => {
  try {
    const { authKey, customerKey, userId } = await req.json();
    if (!authKey || !customerKey || !userId) {
      return json({ error: "authKey, customerKey, userId 필수" }, 400);
    }

    // ── 1. 빌링키 발급 ──────────────────────────────────────────────
    const issueRes = await fetch(`${TOSS_BASE}/v1/billing/authorizations/issue`, {
      method: "POST",
      headers: {
        Authorization: tossAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ authKey, customerKey }),
    });
    if (!issueRes.ok) {
      const err = await issueRes.json();
      return json({ error: "빌링키 발급 실패", detail: err }, 502);
    }
    const { billingKey } = await issueRes.json();

    // ── 2. 최초 결제 승인 (Idempotency-Key 필수) ────────────────────
    const orderId = crypto.randomUUID();
    const chargeRes = await fetch(`${TOSS_BASE}/v1/billing/${billingKey}`, {
      method: "POST",
      headers: {
        Authorization: tossAuthHeader(),
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(), // 🚨 이중 출금 차단
      },
      body: JSON.stringify({
        customerKey,
        amount: 4900,
        orderId,
        orderName: "LEGAL-OS 월 구독",
        currency: "KRW",
      }),
    });
    if (!chargeRes.ok) {
      const err = await chargeRes.json();
      return json({ error: "최초 결제 실패", detail: err }, 502);
    }
    const chargeData = await chargeRes.json();

    // ── 3. DB 갱신 (SERVICE_ROLE_KEY) ────────────────────────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const { error: dbErr } = await supabase.from("subscriptions").upsert({
      user_id: userId,
      billing_key: billingKey,           // 실제 운영 시 암호화 적용 권장
      status: "ACTIVE",
      next_billing_date: nextBillingDate.toISOString().split("T")[0],
      last_order_id: orderId,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    if (dbErr) return json({ error: "DB 갱신 실패", detail: dbErr }, 500);

    return json({ success: true, orderId, paymentKey: chargeData.paymentKey });
  } catch (e) {
    return json({ error: "서버 오류", detail: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
