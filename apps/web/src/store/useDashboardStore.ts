import { create } from "zustand";

interface DashboardState {
  currentScore: number;
  targetScore: number;
  daysLeft: number;
  visaCode: string;
  targetVisa: string;
  workLogs: { date: string }[];
  clockedInToday: boolean;
  dailyWage: number;
  shieldStatus: "SAFE" | "WARNING" | "DANGER";
  updateVisaScore: (delta: number) => void;
  updateIncome: (dailyWage: number) => void;
  toggleClockIn: () => void;
  setShieldStatus: (s: "SAFE" | "WARNING" | "DANGER") => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  currentScore: 68,
  targetScore: 120,
  daysLeft: 142,
  visaCode: "E-9",
  targetVisa: "E-7-4",
  clockedInToday: false,
  dailyWage: 76_960,
  workLogs: Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(i + 1);
    return { date: d.toISOString().slice(0, 10) };
  }),
  shieldStatus: "SAFE",
  updateVisaScore: (delta) =>
    set((s) => ({ currentScore: Math.min(s.currentScore + delta, s.targetScore) })),
  updateIncome: (dailyWage) => set(() => ({ dailyWage })),
  toggleClockIn: () =>
    set((s) => {
      const today = new Date().toISOString().slice(0, 10);
      if (s.clockedInToday) {
        return { clockedInToday: false, workLogs: s.workLogs.filter((l) => l.date !== today) };
      }
      const already = s.workLogs.some((l) => l.date === today);
      return { clockedInToday: true, workLogs: already ? s.workLogs : [...s.workLogs, { date: today }] };
    }),
  setShieldStatus: (status) => set(() => ({ shieldStatus: status })),
}));
