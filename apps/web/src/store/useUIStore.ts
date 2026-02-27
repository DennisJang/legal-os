import { create } from "zustand";

interface UIStore {
  theme: "dark" | "light";
  isPaletteOpen: boolean;
  isDisclaimerChecked: boolean;
  toggleTheme: () => void;
  togglePalette: () => void;
  setDisclaimer: (v: boolean) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  theme: "dark",
  isPaletteOpen: false,
  isDisclaimerChecked: false,
  toggleTheme: () =>
    set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
  togglePalette: () =>
    set((s) => ({ isPaletteOpen: !s.isPaletteOpen })),
  setDisclaimer: (v) => set({ isDisclaimerChecked: v }),
}));