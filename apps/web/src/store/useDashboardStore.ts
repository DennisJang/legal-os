import { create } from "zustand";
import { createBrowserClient } from '@supabase/ssr';

export interface SpecUpdatePayload {
  current_annual_income?: number;
  topik_level?: number;
  education_level?: string;
}

// ── [1] 백엔드 규격과 100% 일치하는 출퇴근 기록 타입 ──
export interface DailyWorkLog {
  work_date: string;          // "YYYY-MM-DD"
  clock_in: string;           // 🚨 관제탑 패치: DB 컬럼명 일치
  clock_out: string;          // 🚨 관제탑 패치: DB 컬럼명 일치
  break_minutes: number;      // 🚨 관제탑 패치: 휴게시간 교체
}

export interface MonthlyWageResult {
  base_pay: number;
  night_bonus_pay: number;
  overtime_pay: number;
  weekly_holiday_pay: number;
  total_pay: number;          // 🚨 관제탑 패치: 실제 반환키 일치
  snapshot_min_wage: number;
  target_month: string;
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
  markedDates: Set<string>;
  monthlyWage: MonthlyWageResult | null;
  wageLoading: boolean;

  hydrate: (user: UserProfile) => void;
  reset: () => void;
  updateSpecOptimistic: (payload: SpecUpdatePayload, supabase: ReturnType<typeof createBrowserClient>) => Promise<void>;
  saveWorkLog: (log: DailyWorkLog, supabase: ReturnType<typeof createBrowserClient>) => Promise<void>;
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  user: null, // 🚨 관제탑 패치: 가짜 더미 삭제! 무조건 구글 로그인 UUID 사용
  isHydrated: false,
  markedDates: new Set<string>(),
  monthlyWage: null,
  wageLoading: false,

  hydrate: (user) => set({ user, isHydrated: true }),
  reset: () => set({ user: null, isHydrated: false, markedDates: new Set(), monthlyWage: null }),

  updateSpecOptimistic: async (payload, supabase) => {
    const { user } = get();
    if (!user) return; 

    const snapshot = {
      current_score: user.current_score,
      current_annual_income: user.current_annual_income,
      topik_level: user.topik_level,
    };

    const optimisticScore = Math.min((user.current_score ?? 0) + 5, user.target_score ?? 100);
    set({ user: { ...user, ...payload, current_score: optimisticScore } });

    try {
      const { error } = await supabase.rpc('update_user_spec', { 
        p_new_income: payload.current_annual_income ?? user.current_annual_income ?? 0,
        p_new_topik: payload.topik_level ?? user.topik_level ?? 0
      });
      if (error) throw error;

      const { data } = await supabase.from('visa_trackers').select('current_score').eq('user_id', user.id).single();
      if (data) {
        const currentUser = get().user;
        if (currentUser) set({ user: { ...currentUser, current_score: data.current_score } });
      }
    } catch (error) {
      console.error("[Optimistic Update Failed]:", error);
      const currentUser = get().user;
      if (currentUser) set({ user: { ...currentUser, ...snapshot } });
      alert('네트워크 오류가 발생했습니다.');
    }
  },

  // ── [3] saveWorkLog: 달력 기록 & Edge Function 연동 ──
  saveWorkLog: async (log, supabase) => {
    const { user } = get();
    if (!user) return;

    const prev = new Set(get().markedDates);
    set({ markedDates: new Set([...prev, log.work_date]) });

    try {
      const { error: dbError } = await supabase
        .from('daily_work_logs')
        .upsert({ user_id: user.id, ...log }, { onConflict: 'user_id,work_date' });
      
      if (dbError) throw dbError;

      set({ wageLoading: true });
      const yearMonth = log.work_date.slice(0, 7);
      
      // 🚨 관제탑 패치: RPC 직접 호출 금지. Edge Function 호출.
      const { data, error: fnError } = await supabase.functions.invoke('get-wage-summary', {
        body: { target_month: yearMonth }
      });

      if (fnError || !data?.success) throw fnError || new Error(data?.error);
      
      set({ monthlyWage: data.data, wageLoading: false });

    } catch (err) {
      console.error('[saveWorkLog failed]', err);
      set({ markedDates: prev, wageLoading: false });
      alert('출퇴근 기록 저장 중 오류가 발생했습니다.');
    }
  },
}));