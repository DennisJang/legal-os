// supabase/functions/_shared/ai-parser/gemini-adapter.ts
// ============================================================
// Gemini 1.5 Flash 어댑터 — AI_Parser_Interface 구현체
// responseMimeType: "application/json" 강제 → 결정론적 JSON 출력
// ============================================================

import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import {
  AI_Parser_Interface,
  ParseImageOptions,
  ParseTextOptions,
  zodValidate,
} from "./interface.ts";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL    = "gemini-1.5-flash-latest";

// Zod 스키마 → Gemini responseSchema 변환 헬퍼
// (Gemini는 OpenAPI subset JSON Schema 형식을 요구)
function zodToGeminiSchema(schema: z.ZodSchema<unknown>): Record<string, unknown> {
  // shape이 있는 ZodObject만 처리 (계약서 파싱 등 object 타입 대상)
  const shape = (schema as z.ZodObject<z.ZodRawShape>).shape;
  if (!shape) return { type: "OBJECT" };

  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const [key, val] of Object.entries(shape)) {
    const field = val as z.ZodTypeAny;
    let geminiType: string;

    if (field instanceof z.ZodString)        geminiType = "STRING";
    else if (field instanceof z.ZodNumber)   geminiType = "NUMBER";
    else if (field instanceof z.ZodBoolean)  geminiType = "BOOLEAN";
    else if (field instanceof z.ZodNullable || field instanceof z.ZodOptional) {
      geminiType = "STRING"; // nullable 필드는 STRING으로 폴백
    }
    else                                     geminiType = "STRING";

    properties[key] = { type: geminiType };

    // optional/nullable이 아니면 required로 마킹
    if (!(field instanceof z.ZodOptional) && !(field instanceof z.ZodNullable)) {
      required.push(key);
    }
  }

  return { type: "OBJECT", properties, required };
}

export class GeminiAdapter implements AI_Parser_Interface {
  private readonly apiKey: string;

  constructor() {
    const key = Deno.env.get("GEMINI_API_KEY");
    if (!key) throw new Error("GEMINI_API_KEY 환경변수 누락");
    this.apiKey = key;
  }

  // ── Text → JSON 파싱 ──────────────────────────────────────
  async parseText<T>(opts: ParseTextOptions<T>): Promise<T> {
    const body = {
      contents: [{ parts: [{ text: opts.prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",         // JSON 강제
        responseSchema:   zodToGeminiSchema(opts.schema),
        temperature:      0,                          // 결정론적 출력
      },
    };

    const raw = await this._call(body);
    return zodValidate(opts.schema, raw, "GeminiAdapter.parseText");
  }

  // ── Image(Vision) → JSON 파싱 ─────────────────────────────
  async parseImage<T>(opts: ParseImageOptions<T>): Promise<T> {
    let imagePart: Record<string, unknown>;

    if (opts.imageBase64) {
      // base64 직접 전달
      imagePart = {
        inlineData: {
          mimeType: opts.mimeType ?? "image/jpeg",
          data:     opts.imageBase64,
        },
      };
    } else if (opts.imageUrl) {
      // 공개 URL → fetch → base64 변환 (Gemini File API 없이 처리)
      const res  = await fetch(opts.imageUrl);
      if (!res.ok) throw new Error(`이미지 URL fetch 실패: ${opts.imageUrl}`);
      const buf  = await res.arrayBuffer();
      const b64  = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const mime = res.headers.get("content-type") ?? "image/jpeg";
      imagePart  = { inlineData: { mimeType: mime, data: b64 } };
    } else {
      throw new Error("imageBase64 또는 imageUrl 중 하나는 필수");
    }

    const body = {
      contents: [{
        parts: [
          imagePart,
          { text: opts.prompt },
        ],
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema:   zodToGeminiSchema(opts.schema),
        temperature:      0,
      },
    };

    const raw = await this._call(body);
    return zodValidate(opts.schema, raw, "GeminiAdapter.parseImage");
  }

  // ── 공통 API 호출 ─────────────────────────────────────────
  private async _call(body: unknown): Promise<unknown> {
    const url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${this.apiKey}`;

    const res = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API 오류 (${res.status}): ${err}`);
    }

    const json = await res.json();

    // Gemini 응답 구조: candidates[0].content.parts[0].text
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini 응답에 text 필드 없음");

    // responseMimeType: application/json 이므로 text가 곧 JSON 문자열
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Gemini JSON 파싱 실패: ${text}`);
    }
  }
}