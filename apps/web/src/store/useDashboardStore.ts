import { create } from "zustand";

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  nationality: string | null;
  current_score: number | null;
  target_score: number | null;
  current_visa_code: string | null;
  target_visa_code: string | null;
};

type DashboardStore = {
  user: UserProfile | null;
  isHydrated: boolean;
  hydrate: (user: UserProfile) => void;
  reset: () => void;
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  user: null,
  isHydrated: false,
  hydrate: (user) => set({ user, isHydrated: true }),
  reset: () => set({ user: null, isHydrated: false }),
}));
