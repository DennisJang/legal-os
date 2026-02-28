import { create } from "zustand";

type SubscriptionStatus = "IDLE" | "ACTIVE" | "PAST_DUE" | "CANCELED";

interface PaymentState {
  status: SubscriptionStatus;
  planType: "BASIC" | "PREMIUM_LEGAL" | null;
  activateSubscription: () => void;   // Optimistic UI
  resetSubscription: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  status: "IDLE",
  planType: null,
  activateSubscription: () =>
    set(() => ({ status: "ACTIVE", planType: "BASIC" })),
  resetSubscription: () =>
    set(() => ({ status: "IDLE", planType: null })),
}));
