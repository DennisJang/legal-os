import { create } from "zustand";
import { createBrowserClient } from '@supabase/ssr';

export interface SpecUpdatePayload {
  current_annual_income?: number;
  topik_level?: number;
  education_level?: string;
}

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  nationality: string | null;
  current_score: number | null;
  target_score: number | null;
  current_visa_code: string | null;
  target_visa_code: string | null;
  current_annual_income?: number | null;
  topik_level?: number | null;
};

type DashboardStore = {
  user: UserProfile | null;
  isHydrated: boolean;
  hydrate: (user: UserProfile) => void;
  reset: () => void;
  updateSpecOptimistic: (
    payload: SpecUpdatePayload,
    supabase: ReturnType<typeof createBrowserClient>
  ) => Promise<void>;
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  user: {
    id: 'dennis-ceo-001',
    email: 'dennis@legal-os.com',
    full_name: 'Dennis Jang',
    nationality: 'South Korea', // 또는 해당 국가
    current_score: 55,         // 링 게이지가 즉시 55% 지점까지 차오릅니다.
    target_score: 80,          // 목표치 설정
    current_visa_code: 'D-2',
    target_visa_code: 'E-7',
    current_annual_income: 30000000,
    topik_level: 3
  },
  
  isHydrated: true, // 로딩 상태를 즉시 종료하기 위해 true로 설정
  hydrate: (user) => set({ user, isHydrated: true }),
  reset: () => set({ user: null, isHydrated: false }),
  // [관제탑 패치] updateSpecOptimistic 액션
  updateSpecOptimistic: async (
    payload: SpecUpdatePayload,
    supabase: ReturnType<typeof createBrowserClient>
  ) => {
    const { user } = get();
    if (!user) return; // 🛡️ [관제탑 패치] Null 방어막

    // ── STEP 1: 롤백용 스냅샷 깊은 복사
    const snapshot = {
      current_score: user.current_score,
      current_annual_income: user.current_annual_income,
      topik_level: user.topik_level,
    };

    // ── STEP 2: 낙관적 선반영 (도파민 루프) — 간이 점수 +5 즉각 반영
    const optimisticScore = Math.min((user.current_score ?? 0) + 5, user.target_score ?? 100);
    set({ user: { ...user, ...payload, current_score: optimisticScore } });

    try {
      // ── STEP 3: 백엔드 RPC 호출 (🚨 관제탑 패치: Domain A 파라미터명과 정확히 매칭)
      const { error } = await supabase.rpc('update_user_spec', { 
        p_new_income: payload.current_annual_income ?? user.current_annual_income ?? 0,
        p_new_topik: payload.topik_level ?? user.topik_level ?? 0
      });
      
      if (error) throw error;

      // ── STEP 4: 성공 시 진짜 DB 점수로 싱크
      const { data } = await supabase
        .from('visa_trackers')
        .select('current_score')
        .eq('user_id', user.id) // 명시적 RLS
        .single();
        
      if (data) {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, current_score: data.current_score } });
        }
      }

    } catch (error) {
      // ── STEP 5: 실패 시 즉각 원래 상태로 롤백
      console.error("[Optimistic Update Failed]:", error);
      const currentUser = get().user;
      if (currentUser) {
        set({ user: { ...currentUser, ...snapshot } });
      }
      alert('네트워크 오류가 발생했습니다. 변경사항이 롤백됩니다.');
    }
  },
}));