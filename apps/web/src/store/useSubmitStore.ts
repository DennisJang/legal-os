import { create } from "zustand";

type Status = "idle" | "pending" | "success" | "error";

interface SubmitStore {
  faxStatus: Status;
  pdfUrl: string | null;
  // Optimistic UI: 즉시 pending으로 올리고 webhook으로 최종 확정
  submitFax: () => void;
  resolveFax: (url: string) => void;
  rejectFax: () => void;
  reset: () => void;
}

export const useSubmitStore = create<SubmitStore>()((set) => ({
  faxStatus: "idle",
  pdfUrl: null,
  submitFax: () => set({ faxStatus: "pending" }),
  resolveFax: (url) => set({ faxStatus: "success", pdfUrl: url }),
  rejectFax: () => set({ faxStatus: "error" }),
  reset: () => set({ faxStatus: "idle", pdfUrl: null }),
}));
