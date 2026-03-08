import { create } from "zustand";
import { createBrowserClient } from '@supabase/ssr';

function calcWorkMinutes(clockIn: string, clockOut: string, breakMin: number): number {
  const toMinutes = (s: string) => {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
      return kst.getUTCHours() * 60 + kst.getUTCMinutes();
    }
    const parts = s.split(":").map(Number);
    return parts[0] * 60 + (parts[1] ?? 0);
  };
  const totalMin = toMinutes(clockOut) - toMinutes(clockIn);
  return Math.max(0, totalMin - breakMin);
}

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
  hourly_wage: number;
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
  user: UserProfile | null;
  isHydrated: boolean;
  markedDates: Set<string>;
  monthlyWage: MonthlyWageResult | null;
  wageLoading: boolean;
  hydrate: (user: UserProfile) => void;
  reset: () => void;
  updateSpecOptimistic: (payload: SpecUpdatePayload, supabase: ReturnType<typeof createBrowserClient>) => Promise<void>;
  saveWorkLog: (log: DailyWorkLog, supabase: ReturnType<typeof createBrowserClient>) => Promise<void>;
  isDisclaimerOpen: boolean;
  pendingFaxPayload: FaxPayload | null;
  openDisclaimer: (payload: FaxPayload) => void;
  closeDisclaimer: () => void;
  submitFaxWithLiability: (supabase: ReturnType<typeof createBrowserClient>) => Promise<void>;
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
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
        p_new_topik:  payload.topik_level           ?? user.topik_level           ?? 0,
      });
      if (error) throw error;
      const { data } = await supabase
        .from('visa_trackers')
        .select('current_score')
        .eq('user_id', user.id)
        .single();
      if (data) {
        const currentUser = get().user;
        if (currentUser) set({ user: { ...currentUser, current_score: data.current_score } });
      }
    } catch (error) {
      console.error("[Optimistic Update Failed]:", error);
      const currentUser = get().user;
      if (currentUser) set({ user: { ...currentUser, ...snapshot } });
    }
  },

  saveWorkLog: async (log, supabase) => {
    const { user } = get();
    if (!user) return;
    const prev = new Set(get().markedDates);
    set({ markedDates: new Set([...prev, log.work_date]) });
    const payload = {
      user_id:               user.id,
      work_date:             log.work_date,
      clock_in_time:         log.clock_in,
      clock_out_time:        log.clock_out,
      snapshot_minimum_wage: log.hourly_wage,
      hourly_wage:           log.hourly_wage,
      actual_work_minutes:   calcWorkMinutes(log.clock_in, log.clock_out, log.break_minutes),
    };
    try {
      const { error: insertError } = await supabase
        .from('daily_work_logs')
        .insert(payload);
      if (insertError) {
        const isDuplicate = insertError.code === '23505'
          || (insertError as any).status === 409
          || insertError.message?.includes('duplicate')
          || insertError.message?.includes('unique');
        if (isDuplicate) {
          const { error: updateError } = await supabase
            .from('daily_work_logs')
            .update({
              clock_in_time:       payload.clock_in_time,
              clock_out_time:      payload.clock_out_time,
              hourly_wage:         payload.hourly_wage,
              actual_work_minutes: payload.actual_work_minutes,
            })
            .eq('user_id', user.id)
            .eq('work_date', log.work_date);
          if (updateError) throw updateError;
        } else {
          throw insertError;
        }
      }
      set({ wageLoading: true });
      const yearMonth = log.work_date.slice(0, 7);
      const { data, error: fnError } = await supabase.functions.invoke('get-wage-summary', {
        body: { target_month: yearMonth, user_id: user.id },
      });
      if (!fnError && data?.success) {
        set({ monthlyWage: data.data, wageLoading: false });
      } else {
        set({ wageLoading: false });
      }
    } catch (err) {
      console.error('[saveWorkLog failed]', err);
      set({ markedDates: prev, wageLoading: false });
    }
  },

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
      closeDisclaimer();
    } catch (err) {
      console.error('[Fax Submission Failed]:', err);
    }
  },
}));