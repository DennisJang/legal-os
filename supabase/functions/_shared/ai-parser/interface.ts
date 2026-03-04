// supabase/functions/_shared/ai-parser/interface.ts
// ============================================================
// AI_Parser_Interface — 어댑터 패턴 추상화 레이어
// .env AI_PROVIDER 변수 1개로 엔진 교체 가능
// ============================================================

import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// ── 타입 정의 ───────────────────────────────────────────────

export interface ParseTextOptions<T> {
  prompt: string;
  schema: z.ZodSchema<T>;
}

export interface ParseImageOptions<T> {
  imageBase64?: string;
  imageUrl?: string;
  mimeType?: string;
  prompt: string;
  schema: z.ZodSchema<T>;
}

export interface AI_Parser_Interface {
  parseText<T>(opts: ParseTextOptions<T>): Promise<T>;
  parseImage<T>(opts: ParseImageOptions<T>): Promise<T>;
}

// ── Zod 검증 게이트 (hallucination 차단 레이어) ──────────────

export function zodValidate<T>(
  schema: z.ZodSchema<T>,
  raw: unknown,
  source: string,
): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `[${i.path.join(".")}] ${i.message}`)
      .join(", ");
    throw new Error(`Zod 검증 실패 (${source}): ${issues}`);
  }
  return result.data;
}

// ── 팩토리: AI_PROVIDER 환경변수로 어댑터 선택 ──────────────

export async function createParser(): Promise<AI_Parser_Interface> {
  const provider = Deno.env.get("AI_PROVIDER") ?? "gemini";

  switch (provider) {
    case "gemini": {
      const { GeminiAdapter } = await import("./gemini-adapter.ts");
      return new GeminiAdapter();
    }
    case "openai": {
      const { OpenAIAdapter } = await import("./openai-adapter.ts");
      return new OpenAIAdapter();
    }
    default:
      throw new Error(`지원하지 않는 AI_PROVIDER: ${provider}`);
  }
}