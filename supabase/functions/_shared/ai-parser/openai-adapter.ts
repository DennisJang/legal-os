// supabase/functions/_shared/ai-parser/openai-adapter.ts
// ============================================================
// OpenAI 어댑터 스텁 — AI_Parser_Interface 구현체
// AI_PROVIDER=openai 로 전환 시 활성화
// Structured Outputs (response_format: json_object) 사용
// ============================================================

// z는 zodValidate 내부에서 사용되므로 직접 import 불필요 — 제거
import {
  AI_Parser_Interface,
  ParseImageOptions,
  ParseTextOptions,
  zodValidate,
} from "./interface.ts";

const OPENAI_API_BASE = "https://api.openai.com/v1";
const OPENAI_MODEL    = "gpt-4o-mini";

export class OpenAIAdapter implements AI_Parser_Interface {
  private readonly apiKey: string;

  constructor() {
    const key = Deno.env.get("OPENAI_API_KEY");
    if (!key) throw new Error("OPENAI_API_KEY 환경변수 누락");
    this.apiKey = key;
  }

  async parseText<T>(opts: ParseTextOptions<T>): Promise<T> {
    const body = {
      model:           OPENAI_MODEL,
      messages:        [{ role: "user", content: opts.prompt }],
      response_format: { type: "json_object" },
      temperature:     0,
    };
    const raw = await this._call(body);
    return zodValidate(opts.schema, raw, "OpenAIAdapter.parseText");
  }

  async parseImage<T>(opts: ParseImageOptions<T>): Promise<T> {
    const imageContent = opts.imageBase64
      ? {
          type:      "image_url",
          image_url: {
            url: `data:${opts.mimeType ?? "image/jpeg"};base64,${opts.imageBase64}`,
          },
        }
      : {
          type:      "image_url",
          image_url: { url: opts.imageUrl },
        };

    const body = {
      model:           "gpt-4o",
      messages:        [{
        role:    "user",
        content: [imageContent, { type: "text", text: opts.prompt }],
      }],
      response_format: { type: "json_object" },
      temperature:     0,
    };
    const raw = await this._call(body);
    return zodValidate(opts.schema, raw, "OpenAIAdapter.parseImage");
  }

  private async _call(body: unknown): Promise<unknown> {
    const res = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API 오류 (${res.status}): ${err}`);
    }

    const json    = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI 응답에 content 없음");

    try {
      return JSON.parse(content);
    } catch {
      throw new Error(`OpenAI JSON 파싱 실패: ${content}`);
    }
  }
}