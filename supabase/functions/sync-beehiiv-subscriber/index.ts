// supabase/functions/sync-beehiiv-subscriber/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BEEHIIV_API_KEY = Deno.env.get("BEEHIIV_API_KEY")!;
const BEEHIIV_PUB_ID = Deno.env.get("BEEHIIV_PUB_ID")!;

serve(async (req: Request): Promise<Response> => {
  // [루프 단절 헌법] 어떤 경우에도 200 OK 반환
  try {
    const body = await req.json();
    const email: string | undefined = body?.record?.email;

    if (!email) {
      console.error("[sync-beehiiv] email 파싱 실패:", JSON.stringify(body));
      return new Response("ok", { status: 200 });
    }

    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${BEEHIIV_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: "legal-os-app",
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[sync-beehiiv] Beehiiv API 오류 ${res.status}:`, errText);
    } else {
      console.log(`[sync-beehiiv] 구독 등록 성공: ${email}`);
    }
  } catch (err) {
    // 파싱/네트워크 오류 무관 — 루프 단절 헌법 준수
    console.error("[sync-beehiiv] 예외 발생:", err);
  }

  return new Response("ok", { status: 200 });
});