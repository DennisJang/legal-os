import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req: Request) => {
  const ok200 = new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  if (req.method !== "POST") return ok200;

  const payload = await req.json().catch(() => null);
  if (!payload || !payload.receiptNum || !payload.result) return ok200;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const newStatus = payload.result === "SUCCESS" ? "SUCCESS" : "FAILED";

    // 🛡️ 멱등성 방어 및 관제탑 패치 컬럼(result_message, updated_at) 동기화
    const { error } = await supabase
      .from("fax_transmissions")
      .update({
        status: newStatus,
        result_message: payload.resultMessage ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("receipt_num", payload.receiptNum)
      .eq("status", "QUEUED"); // 이미 처리된 건은 무시

    if (error) console.error("[webhook-fax-handler] DB 갱신 실패:", error.message);
  } catch (e) {
    console.error("[webhook-fax-handler] 예외:", String(e));
  }

  return ok200; // 루프 단절 헌법
});