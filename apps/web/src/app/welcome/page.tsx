"use client";
import { useState } from "react";
import WelcomeKorea from "@/components/WelcomeKorea";
import ThemeSelector from "@/components/ThemeSelector";

export default function WelcomePage() {
  const [step, setStep] = useState<"welcome" | "theme">("welcome");

  if (step === "theme") return <ThemeSelector />;
  return <WelcomeKorea onEnter={() => setStep("theme")} />;
}