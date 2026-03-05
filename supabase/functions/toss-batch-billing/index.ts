import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const TOSS_SECRET_KEY = Deno.env.get("TOSS_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const tossAuthHeader = `Basic ${btoa(TOSS_SECRET_KEY + ":")}`;

serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  
  // 🚨 관제탑 패치: Domain A(pg_cron)가 쏘는 SERVICE_ROLE_KEY와 규격 일치 (아군 사격 방어)
  const authHeader = req.headers.get("Authorization") ?? "";
  if (authHeader !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const today = new Date().toISOString().split("T")[0];

  // 🚨 관제탑 패치: subscription.id(FK) 추출 추가
  const { data: targets } = await supabase
    .from("subscriptions")
    .select("id, user_id, toss_billing_key, customer_key")
    .eq("status", "ACTIVE")
    .lte("next_billing_date", today);

  if (!targets || targets.length === 0) return new Response(JSON.stringify({ processed: 0 }), { status: 200 });

  const results = [];
  for (const sub of targets) {
    const orderId = crypto.randomUUID();
    const chargeRes = await fetch(`https://api.tosspayments.com/v1/billing/${sub.toss_billing_key}`, {
      method: "POST",
      headers: { Authorization: tossAuthHeader, "Content-Type": "application/json", "Idempotency-Key": orderId },
      body: JSON.stringify({ customerKey: sub.customer_key || sub.user_id, amount: 4900, orderId, orderName: "Legal-OS 월 정기결제" }),
    });

    const isSuccess = chargeRes.ok;
    const chargeData = await chargeRes.json().catch(()=>({}));

    await supabase.from("payment_transactions").insert({
      subscription_id: sub.id,
      idempotency_key: orderId,
      toss_payment_key: isSuccess ? chargeData.paymentKey : null,
      amount: 4900,
      status: isSuccess ? "PENDING" : "FAILED",
    });

    results.push({ userId: sub.user_id, status: isSuccess ? "SUCCESS" : "FAILED" });
  }

  return new Response(JSON.stringify({ processed: targets.length, results }), { status: 200, headers: { "Content-Type": "application/json" } });
});