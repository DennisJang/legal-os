"use client";

import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function GoogleAuthButton() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="w-full h-14 rounded-[14px] bg-[#0071E3] text-white font-semibold text-[17px] tracking-[-0.022em] flex items-center justify-center gap-3 active:scale-[0.97] active:opacity-80 transition-all duration-100 linear"
    >
      Google로 시작하기
    </button>
  );
}
