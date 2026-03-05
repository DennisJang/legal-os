import { create } from "zustand";
import { createBrowserClient } from '@supabase/ssr';

export interface SpecUpdatePayload {
  current_annual_income?: number;
  topik_level?: number;
  education_level?: string;
}

export interface DailyWorkLog {
  work_date: string;
  clock_in: string;
  clock_out: string;
  break_minutes: number;
}

export interface MonthlyWageResult {
  base_pay: number;
  night_bonus_pay: number;
  overtime_pay: number;
  weekly_holiday_pay: number;
  total_pay: number;
  snapshot_min_wage: number;
  target_month: string;
}

// ── [NEW] 팩스 Payload 타입 ──
export interface FaxPayload {
  userId: string;
  zipcode: string;
  contractData?: Record<string, unknown>;
  arc_image_url: string;
  form_template_path: string;
  idempotency_key: string;
  document_type: string;
  liability_agreed?: boolean;
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
  // ── 기존 상태 ──
  user: UserProfile | null;
  isHydrated: boolean;
  markedDates: Set<string>;
  monthlyWage: MonthlyWageResult | null;
  wageLoading: boolean;

  hydrate: (user: UserProfile) => void;
  reset: () => void;
  updateSpecOptimistic: (payload: SpecUpdatePayload, supabase: ReturnType<typeof createBrowserClient>) => Promise<void>;
  saveWorkLog: (log: DailyWorkLog, supabase: ReturnType<typeof createBrowserClient>) => Promise<void>;

  // ── [NEW] 팩스 면책 동의 상태 ──
  isDisclaimerOpen: boolean;
  pendingFaxPayload: FaxPayload | null;
  openDisclaimer: (payload: FaxPayload) => void;
  closeDisclaimer: () => void;
  submitFaxWithLiability: (supabase: ReturnType<typeof createBrowserClient>) => Promise<void>;
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // ── 기존 초기값 ──
  user: null,
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
        p_new_topik: payload.topik_level ?? user.topik_level ?? 0,
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

      const { data, error: fnError } = await supabase.functions.invoke('get-wage-summary', {
        body: { target_month: yearMonth },
      });

      if (fnError || !data?.success) throw fnError || new Error(data?.error);

      set({ monthlyWage: data.data, wageLoading: false });
    } catch (err) {
      console.error('[saveWorkLog failed]', err);
      set({ markedDates: prev, wageLoading: false });
      alert('출퇴근 기록 저장 중 오류가 발생했습니다.');
    }
  },

  // ── [NEW] 팩스 면책 동의 액션 ──
  isDisclaimerOpen: false,
  pendingFaxPayload: null,

  openDisclaimer: (payload) => set({ isDisclaimerOpen: true, pendingFaxPayload: payload }),
  closeDisclaimer: () => set({ isDisclaimerOpen: false, pendingFaxPayload: null }),

  submitFaxWithLiability: async (supabase) => {
    const { pendingFaxPayload, closeDisclaimer } = get();
    if (!pendingFaxPayload) return;
    try {
      const { data, error } = await supabase.functions.invoke('send-immigration-fax', {
        body: { ...pendingFaxPayload, liability_agreed: true },
      });
      if (error || (data && !data.success)) throw error || new Error(data?.error);
      alert('성공적으로 관공서 팩스 발송 대기열에 등록되었습니다!');
      closeDisclaimer();
    } catch (err) {
      console.error('[Fax Submission Failed]:', err);
      alert('팩스 발송 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  },
}));