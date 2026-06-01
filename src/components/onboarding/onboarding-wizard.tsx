"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";

const STEPS = [
  {
    id: "style",
    title: "Trading Style",
    description: "How do you trade?",
    options: ["Scalper", "Day Trader", "Swing Trader", "Position Trader"],
    field: "tradingStyle" as const,
    multiple: false,
  },
  {
    id: "markets",
    title: "Markets",
    description: "Which markets do you trade?",
    options: ["Forex", "Crypto", "Options", "Futures", "Stocks"],
    field: "markets" as const,
    multiple: true,
  },
  {
    id: "experience",
    title: "Experience Level",
    description: "How experienced are you?",
    options: ["Beginner", "Intermediate", "Advanced"],
    field: "experience" as const,
    multiple: false,
  },
  {
    id: "strategies",
    title: "Trading Strategies",
    description: "Which strategies do you use?",
    options: ["ICT", "SMC", "Wyckoff", "Price Action", "Algo"],
    field: "strategies" as const,
    multiple: true,
  },
  {
    id: "goals",
    title: "Trading Goals",
    description: "What are you working towards?",
    options: ["Consistency", "Prop Firm Challenge", "Psychological Discipline", "Income"],
    field: "goals" as const,
    multiple: true,
  },
  {
    id: "sessions",
    title: "Trading Sessions",
    description: "When do you usually trade?",
    options: ["Asian", "London", "NY AM", "NY PM"],
    field: "sessions" as const,
    multiple: true,
  },
];

type FormData = {
  tradingStyle: string;
  markets: string[];
  experience: string;
  strategies: string[];
  goals: string[];
  sessions: string[];
};

export function OnboardingWizard() {
  const router = useRouter();
  const { update } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { onboardingDraft, setOnboardingDraft } = useAppStore();

  const [formData, setFormData] = useState<FormData>(() => ({
    tradingStyle: typeof onboardingDraft?.tradingStyle === "string" ? onboardingDraft.tradingStyle : "",
    markets: Array.isArray(onboardingDraft?.markets) ? onboardingDraft.markets as string[] : [],
    experience: typeof onboardingDraft?.experience === "string" ? onboardingDraft.experience : "",
    strategies: Array.isArray(onboardingDraft?.strategies) ? onboardingDraft.strategies as string[] : [],
    goals: Array.isArray(onboardingDraft?.goals) ? onboardingDraft.goals as string[] : [],
    sessions: Array.isArray(onboardingDraft?.sessions) ? onboardingDraft.sessions as string[] : [],
  }));

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  const handleSelect = (option: string) => {
    if (step.multiple) {
      const field = step.field as keyof FormData;
      const current = formData[field] as string[];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      const next = { ...formData, [field]: updated };
      setFormData(next);
      setOnboardingDraft(next);
    } else {
      const next = { ...formData, [step.field]: option };
      setFormData(next);
      setOnboardingDraft(next);
    }
  };

  const isSelected = (option: string) => {
    const value = formData[step.field as keyof FormData];
    if (Array.isArray(value)) return value.includes(option);
    return value === option;
  };

  const canProceed = () => {
    const value = formData[step.field as keyof FormData];
    if (Array.isArray(value)) return value.length > 0;
    return !!value;
  };

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to save profile");
        return;
      }

      setOnboardingDraft(null);
      await update();
      toast.success("Profile setup complete! Welcome to TradeMind.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="gradient-orb w-96 h-96 -top-48 -left-48 fixed" />
      <div className="gradient-orb w-72 h-72 -bottom-36 -right-36 fixed" style={{ background: "radial-gradient(circle, rgba(34, 197, 94, 0.3), transparent 70%)" }} />

      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(((currentStep + 1) / STEPS.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent-green rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{step.title}</CardTitle>
                <CardDescription className="text-base">{step.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "grid gap-3",
                  step.options.length <= 4 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
                )}>
                  {step.options.map((option) => (
                    <motion.button
                      key={option}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(option)}
                      className={cn(
                        "relative flex items-center justify-center p-4 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                        isSelected(option)
                          ? "border-primary bg-primary/10 text-primary-300 shadow-glow"
                          : "border-white/[0.08] bg-muted/50 text-muted-foreground hover:border-white/20 hover:bg-muted"
                      )}
                    >
                      {isSelected(option) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2"
                        >
                          <Check className="h-4 w-4 text-primary-400" />
                        </motion.div>
                      )}
                      {option}
                    </motion.button>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-8">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    disabled={currentStep === 0}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed() || isSubmitting}
                    className="gap-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : isLastStep ? (
                      <>
                        Complete
                        <Check className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
