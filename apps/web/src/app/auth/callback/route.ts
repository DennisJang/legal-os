import { createServerClient } from "@supabase/ssr";
import { NextResponse }       from "next/server";
import type { NextRequest }   from "next/server";
import { cookies }            from "next/headers";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/welcome";

  // Vercel / Codespaces 프록시 환경에서 실제 host 사용
  const forwardedHost = req.headers.get("x-forwarded-host");
  const isLocalEnv    = process.env.NODE_ENV === "development";
  const baseUrl       = isLocalEnv
    ? origin
    : forwardedHost
      ? `https://${forwardedHost}`
      : origin;

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: ()             => cookieStore.getAll(),
          setAll: (cookiesToSet) =>
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            ),
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // 단일 리다이렉트 — 체인 없음
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
}