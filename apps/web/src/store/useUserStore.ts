import { create } from "zustand";
import { persist } from "zustand/middleware";

type Visa = "E-7" | "E-9" | "F-4" | "F-5" | "F-6" | "D-10" | "H-2";

interface UserSpec {
  visaType: Visa | null;
  hourlyWage: number;
  weeklyHours: number;
  zipCode: string;
}

interface UserStore {
  spec: UserSpec;
  isSubscribed: boolean;
  updateSpec: (patch: Partial<UserSpec>) => void;
  setSubscribed: (v: boolean) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      spec: { visaType: null, hourlyWage: 0, weeklyHours: 0, zipCode: "" },
      isSubscribed: false,
      updateSpec: (patch) =>
        set((s) => ({ spec: { ...s.spec, ...patch } })),
      setSubscribed: (v) => set({ isSubscribed: v }),
    }),
    { name: "legal-os-user" }
  )
);