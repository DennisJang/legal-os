// supabase/functions/toss-recurring-batch/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TOSS_BASE = "https://api.tosspayments.com";

function tossAuthHeader(): string {
  const secret = Deno.env.get("TOSS_SECRET_KEY") ?? "";
  return "Basic " + btoa(secret + ":");
}

serve(async (req) => {
  // pg_cron → pg_net 경유 호출 시 SERVICE_ROLE Bearer 검증
  // 수정 코드
const auth = req.headers.get("Authorization") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
if (!auth.startsWith("Bearer ") || auth.slice(7) !== serviceRoleKey) {
  return json({ error: "Unauthorized", received: auth.slice(0, 20) }, 401);
}

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // ── 1. 오늘 결제 대상 유저 조회 ────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];
  const { data: targets, error: fetchErr } = await supabase
  .from("subscriptions")
  .select("user_id, toss_billing_key")
  .eq("status", "ACTIVE")
  .eq("next_billing_date", today);

  if (fetchErr) return json({ error: "조회 실패", detail: fetchErr }, 500);
  if (!targets || targets.length === 0) return json({ message: "결제 대상 없음" });

  const results: { userId: string; status: string; reason?: string }[] = [];

  // ── 2. 유저별 결제 (건마다 새 Idempotency-Key) ─────────────────────
  for (const sub of targets) {
    const orderId = crypto.randomUUID();
    try {
      const res = await fetch(`${TOSS_BASE}/v1/billing/${sub.toss_billing_key}`, {
        method: "POST",
        headers: {
          Authorization: tossAuthHeader(),
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(), // 🚨 건마다 새 키
        },
        body: JSON.stringify({
          amount: 4900,
          orderId,
          orderName: "LEGAL-OS 월 구독",
          currency: "KRW",
        }),
      });

      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 1);

      if (res.ok) {
        await supabase.from("subscriptions").update({
          status: "ACTIVE",
          next_billing_date: nextDate.toISOString().split("T")[0],
          last_order_id: orderId,
          updated_at: new Date().toISOString(),
        }).eq("user_id", sub.user_id);
        results.push({ userId: sub.user_id, status: "SUCCESS" });
      } else {
        const err = await res.json();
        await supabase.from("subscriptions").update({
          status: "PAYMENT_FAILED",
          updated_at: new Date().toISOString(),
        }).eq("user_id", sub.user_id);
        results.push({ userId: sub.user_id, status: "FAILED", reason: err?.message });
      }
    } catch (e) {
      results.push({ userId: sub.user_id, status: "ERROR", reason: String(e) });
    }
  }

  return json({ processed: results.length, results });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}