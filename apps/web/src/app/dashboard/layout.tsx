import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import HydrationProvider from "@/components/HydrationProvider";

async function getSessionData() {
  // 🛡️ [Next.js 15+ 패치] cookies()는 비동기 함수이므로 반드시 await를 붙여야 합니다.
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name, nationality")
    .eq("user_id", user.id)
    .single();

  const { data: tracker } = await supabase
    .from("visa_trackers")
    .select("current_score, target_score, current_visa_code, target_visa_code")
    .eq("user_id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? "",
    full_name: profile?.full_name ?? null,
    nationality: profile?.nationality ?? null,
    current_score: tracker?.current_score ?? null,
    target_score: tracker?.target_score ?? null,
    current_visa_code: tracker?.current_visa_code ?? null,
    target_visa_code: tracker?.target_visa_code ?? null,
  };
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userData = await getSessionData();
  return <HydrationProvider initialUser={userData}>{children}</HydrationProvider>;
}