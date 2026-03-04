// supabase/functions/get-wage-summary/index.ts
// ============================================================
// [Domain C: Engine-OS] 급여 조회 Edge Function
// calc_monthly_wage_exact RPC 래퍼
// Zod 입력 검증 → RPC 호출 → Zod 출력 검증 → 반환
// ============================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// ── Zod 스키마 정의 ─────────────────────────────────────────

// 입력 검증 스키마
const RequestSchema = z.object({
  target_month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "target_month 형식: YYYY-MM")
    .transform((v) => `${v}-01`),  // RPC에 DATE 형태로 전달
});

// RPC 출력 검증 스키마 (hallucination 차단 게이트)
const WageResultSchema = z.object({
  base_pay:           z.number().int().nonnegative(),
  night_bonus_pay:    z.number().int().nonnegative(),
  overtime_pay:       z.number().int().nonnegative(),
  weekly_holiday_pay: z.number().int().nonnegative(),
  total_pay:          z.number().int().nonnegative(),
  snapshot_min_wage:  z.number().positive(),
  target_month:       z.string(),
});

// RPC 에러 응답 스키마
const WageErrorSchema = z.object({
  error:   z.string(),
  detail:  z.string().optional(),
  user_id: z.string().optional(),
  month:   z.string().optional(),
});

// ── CORS 헤더 ────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── 메인 핸들러 ──────────────────────────────────────────────
serve(async (req: Request) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    // ── 1. JWT 추출 & Supabase 클라이언트 생성 ──────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse(401, "Authorization 헤더 누락");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    // ── 2. 유저 인증 확인 ────────────────────────────────────
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse(401, "인증 실패: 유효하지 않은 JWT");
    }

    // ── 3. 요청 바디 파싱 & Zod 입력 검증 ────────────────────
    const body = await req.json().catch(() => ({}));
    const inputResult = RequestSchema.safeParse(body);

    if (!inputResult.success) {
      return errorResponse(400, "입력 검증 실패", inputResult.error.issues);
    }

    const { target_month } = inputResult.data;

    // ── 4. RPC 호출 ──────────────────────────────────────────
    const { data: rpcData, error: rpcError } = await supabase
      .rpc("calc_monthly_wage_exact", {
        p_user_id:      user.id,
        p_target_month: target_month,
      });

    if (rpcError) {
      console.error("[RPC Error]", rpcError);
      return errorResponse(500, "급여 계산 RPC 실패", rpcError);
    }

    // ── 5. RPC 내부 에러 체크 (RPC가 JSONB error 필드 반환 시) ──
    const maybeError = WageErrorSchema.safeParse(rpcData);
    if (maybeError.success && maybeError.data.error) {
      console.error("[RPC Internal Error]", maybeError.data);
      return errorResponse(500, "급여 계산 내부 오류", maybeError.data);
    }

    // ── 6. Zod 출력 검증 게이트 (hallucination 차단) ─────────
    const outputResult = WageResultSchema.safeParse(rpcData);
    if (!outputResult.success) {
      console.error("[Output Validation Failed]", outputResult.error.issues);
      return errorResponse(500, "출력 스키마 검증 실패 — 데이터 무결성 오류");
    }

    // ── 7. 성공 응답 ──────────────────────────────────────────
    return new Response(
      JSON.stringify({ success: true, data: outputResult.data }),
      {
        status:  200,
        headers: { ...CORS, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("[Unhandled Error]", err);
    return errorResponse(500, "서버 내부 오류");
  }
});

// ── 에러 응답 헬퍼 ───────────────────────────────────────────
function errorResponse(
  status: number,
  message: string,
  detail?: unknown,
): Response {
  return new Response(
    JSON.stringify({ success: false, error: message, detail }),
    {
      status,
      headers: { ...CORS, "Content-Type": "application/json" },
    },
  );
}