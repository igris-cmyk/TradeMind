import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = {
  title: "Setup Your Profile | TradeMind AI Journal",
  description: "Complete your trading profile to get personalised insights and analytics.",
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
