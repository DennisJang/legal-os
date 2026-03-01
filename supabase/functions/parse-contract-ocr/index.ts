import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// ── 1. AI_Parser_Interface (어댑터 추상화) ────────────────────────────────────
interface AI_Parser_Interface {
  parseImage(imageBase64: string, mimeType: string, prompt: string): Promise<unknown>;
}

// ── 2. ⚡ OpenAI 어댑터 (gpt-4o-mini 탑재) ──────────────────────────────────
class OpenAIAdapter implements AI_Parser_Interface {
  private apiKey: string;
  private model = "gpt-4o-mini"; // 가성비와 속도가 압도적인 비전 겸용 모델
  private endpoint = "https://api.openai.com/v1/chat/completions";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async parseImage(imageBase64: string, mimeType: string, prompt: string): Promise<unknown> {
    const body = {
      model: this.model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } }
          ],
        }
      ],
      // 🔒 결정론적 강제: OpenAI Structured Outputs (환각 0% 보장)
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "contract_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              deposit: { type: "number" },
              monthly_rent: { type: "number" },
              expiration_date: { type: "string" }
            },
            required: ["deposit", "monthly_rent", "expiration_date"],
            additionalProperties: false
          }
        }
      }
    };

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error: ${err}`);
    }

    const data = await res.json();
    const raw = data.choices[0].message.content;
    return JSON.parse(raw);
  }
}

// ── 3. 어댑터 팩토리 (.env 변수로 1초 만에 교체) ─────────────────────────
function getParser(): AI_Parser_Interface {
  // 기본값을 openai로 스위칭
  const provider = Deno.env.get("AI_PROVIDER") ?? "openai";
  
  if (provider === "openai") {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OPENAI_API_KEY가 등록되지 않았습니다.");
    return new OpenAIAdapter(apiKey);
  }
  
  throw new Error(`Unknown AI_PROVIDER: ${provider}`);
}

// ── 4. Zod 검증 게이트 (이중 방어막) ────────────────────────────
const ContractSchema = z.object({
  deposit:         z.number().nonnegative(),
  monthly_rent:    z.number().nonnegative(),
  expiration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식 필수"),
});

// ── 5. 이미지 URL → Base64 변환 헬퍼 ─────────────────────────────────────────
async function urlToBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`이미지 URL fetch 실패: ${url}`);
  const mimeType = res.headers.get("content-type") ?? "image/jpeg";
  const buffer   = await res.arrayBuffer();
  const base64   = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return { base64, mimeType };
}

// ── 6. 메인 핸들러 ────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  try {
    const { imageBase64, imageUrl, mimeType } = await req.json();

    let base64: string;
    let mime: string;

    if (imageBase64) {
      base64 = imageBase64;
      mime   = mimeType ?? "image/jpeg";
    } else if (imageUrl) {
      const converted = await urlToBase64(imageUrl);
      base64 = converted.base64;
      mime   = converted.mimeType;
    } else {
      return json({ error: "imageBase64 또는 imageUrl 필수" }, 400);
    }

    const parser = getParser();
    const prompt = `
      이 임대차 계약서 이미지에서 다음 3가지 정보를 추출하라.
      - deposit: 보증금 (숫자, 단위: 원)
      - monthly_rent: 월세 (숫자, 단위: 원)
      - expiration_date: 계약 만료일 (YYYY-MM-DD 형식)
      반드시 JSON만 출력하라.
    `;

    const rawResult = await parser.parseImage(base64, mime, prompt);

    // 🔒 Zod 게이트: 통과 실패 시 400 반환, 다음 로직(pdf-lib) 진입 불가
    const validated = ContractSchema.safeParse(rawResult);
    if (!validated.success) {
      return json({ error: "Zod validation failed", details: validated.error.errors }, 400);
    }

    return json(validated.data, 200);

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