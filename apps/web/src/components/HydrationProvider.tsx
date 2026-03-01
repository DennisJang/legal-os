"use client";

import { useRef } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";

type UserData = {
  id: string;
  email: string;
  full_name: string | null;
  nationality: string | null;
  current_score: number | null;
  target_score: number | null;
  current_visa_code: string | null;
  target_visa_code: string | null;
};

type Props = {
  initialUser: UserData | null;
  children: React.ReactNode;
};

export default function HydrationProvider({ initialUser, children }: Props) {
  const isInitialized = useRef(false);

  if (!isInitialized.current && initialUser) {
    useDashboardStore.getState().hydrate(initialUser);
    isInitialized.current = true;
  }

  return <>{children}</>;
}
