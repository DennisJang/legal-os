import { create } from "zustand";

interface DashboardState {
  // Visa Tracker
  currentScore: number;
  targetScore: number;
  daysLeft: number;
  visaCode: string;
  targetVisa: string;
  // Wage Calendar — 날짜 배열로 관리, 월별 필터링은 컴포넌트에서
  workLogs: { date: string }[];   // "YYYY-MM-DD" 형식
  clockedInToday: boolean;
  dailyWage: number;              // 일급 (최저시급 × 8h 기본값)
  // Safe Home Shield
  shieldStatus: "SAFE" | "WARNING" | "DANGER";
  // Actions
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
  dailyWage: 76_960,   // 9,620원(최저시급) × 8h
  workLogs: [
    // 더미: 이번 달 14일치 사전 입력
    ...Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(i + 1);
      return { date: d.toISOString().slice(0, 10) };
    }),
  ],
  shieldStatus: "SAFE",

  // Optimistic: 서버 응답 대기 없이 즉각 상태 반영
  updateVisaScore: (delta) =>
    set((s) => ({ currentScore: Math.min(s.currentScore + delta, s.targetScore) })),

  updateIncome: (dailyWage: number) =>
    set(() => ({ dailyWage })),

  toggleClockIn: () =>
    set((s) => {
      const today = new Date().toISOString().slice(0, 10);
      if (s.clockedInToday) {
        // 퇴근: 오늘 로그 제거
        return { clockedInToday: false, workLogs: s.workLogs.filter((l) => l.date !== today) };
      } else {
        // 출근: 오늘 날짜 추가 (중복 방지)
        const already = s.workLogs.some((l) => l.date === today);
        return { clockedInToday: true, workLogs: already ? s.workLogs : [...s.workLogs, { date: today }] };
      }
    }),

  setShieldStatus: (status) =>
    set(() => ({ shieldStatus: status })),
}));
