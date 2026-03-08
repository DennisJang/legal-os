import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import HydrationProvider from "@/components/HydrationProvider";
import DashboardTabBar from "@/components/DashboardTabBar";
import { redirect } from "next/navigation";

async function getSessionData() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                // ✅ Codespaces 환경 쿠키 호환성 패치
                sameSite: "lax",
                secure: true,
              })
            );
          } catch { /* Server Component 렌더 중 무시 */ }
        },
      },
    }
  );

  // ✅ getSession 대신 getUser (보안)
  const { data: { user }, error } = await supabase.auth.getUser();
  
  // 🔍 디버그용 — 확인 후 제거
  console.log("[layout] getUser result:", user?.id ?? "NULL", error?.message ?? "");
  
  if (!user) return null;

  const [{ data: profile }, { data: tracker }] = await Promise.all([
    supabase.from("user_profiles").select("full_name, nationality").eq("user_id", user.id).single(),
    supabase.from("visa_trackers").select("current_score, target_score, current_visa_code, target_visa_code").eq("user_id", user.id).single(),
  ]);

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
  if (!userData) redirect("/");

  return (
    <HydrationProvider initialUser={userData}>
      {children}
      <DashboardTabBar />
    </HydrationProvider>
  );
}