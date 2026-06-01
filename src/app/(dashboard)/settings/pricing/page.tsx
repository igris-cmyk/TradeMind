"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Shield } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fadeUp, stagger } from "@/lib/motion";

const PLANS = [
  {
    name: "FREE",
    price: "$0",
    description: "Perfect for getting started with basic journaling.",
    icon: Shield,
    features: [
      "Up to 50 trades per month",
      "Basic text journaling",
      "Standard dashboard analytics",
      "Community support",
    ],
    missingFeatures: [
      "AI Trade Analysis",
      "Advanced Psychology Insights",
      "Unlimited Trades",
      "Screenshot Attachments",
    ],
  },
  {
    name: "PRO",
    price: "$19",
    period: "/mo",
    description: "Advanced analytics and AI coaching for serious traders.",
    icon: Sparkles,
    recommended: true,
    features: [
      "Unlimited trades",
      "AI Trade Analysis (up to 100/mo)",
      "Psychology & Emotion Tracking",
      "Up to 4 screenshots per trade",
      "Priority email support",
    ],
    missingFeatures: [
      "Unlimited AI Analysis",
      "1-on-1 Coaching Access",
    ],
  },
  {
    name: "ELITE",
    price: "$49",
    period: "/mo",
    description: "The ultimate package for professional traders.",
    icon: Zap,
    features: [
      "Unlimited trades",
      "Unlimited AI Trade Analysis",
      "Advanced Psychology Insights",
      "Unlimited screenshot attachments",
      "1-on-1 Monthly Coaching Access",
      "24/7 Priority Support",
    ],
    missingFeatures: [],
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const currentPlan = session?.user?.plan || "FREE";

  const handleUpgrade = async (planName: string) => {
    if (planName === currentPlan) return;
    
    setLoadingPlan(planName);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planName }),
      });

      if (!res.ok) throw new Error("Checkout failed");

      const data = await res.json();
      if (!data.url) throw new Error("Checkout URL missing");

      window.location.href = data.url;
    } catch {
      toast.error("Failed to upgrade plan.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <motion.div 
      className="space-y-8 pb-12 max-w-5xl mx-auto"
      variants={stagger.container(0.06)}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={fadeUp} className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Simple, transparent pricing
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          Choose the plan that fits your trading journey. Upgrade anytime to unlock AI-powered insights and advanced analytics.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4 items-stretch">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan === plan.name;
          const isDowngrade = 
            (currentPlan === "ELITE" && plan.name !== "ELITE") || 
            (currentPlan === "PRO" && plan.name === "FREE");

          return (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              className={cn(
                "flex flex-col h-full relative transition-transform duration-300",
                plan.recommended && "z-10 scale-[1.02]"
              )}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-glow-sm z-20">
                  Recommended
                </div>
              )}
              <Card 
                className={cn(
                  "relative flex-1 flex flex-col glass-card transition-all duration-300",
                  plan.recommended ? "border-primary shadow-glow" : "hover:border-white/[0.12]"
                )}
              >
                
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={cn("h-4.5 w-4.5", plan.recommended ? "text-primary-400" : "text-muted-foreground")} />
                    <CardTitle className="text-base font-semibold">{plan.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-mono tracking-tight">{plan.price}</span>
                    {plan.period && <span className="text-xs text-muted-foreground">{plan.period}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 min-h-[32px] leading-relaxed">
                    {plan.description}
                  </p>
                </CardHeader>
                
                <CardContent className="flex-1 pb-6">
                  <div className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-xs">
                          <Check className="h-3.5 w-3.5 text-accent-green shrink-0 mt-0.5" />
                          <span className="text-foreground/90">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {plan.missingFeatures.length > 0 && (
                      <ul className="space-y-2 pt-3.5 border-t border-white/[0.04]">
                        {plan.missingFeatures.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground/50">
                            <span className="h-3.5 w-3.5 shrink-0 mt-0.5 text-center text-xs leading-none">-</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="pt-0">
                  <Button
                    variant={plan.recommended ? "glow" : "outline"}
                    className="w-full text-xs"
                    disabled={isCurrentPlan || loadingPlan !== null}
                    loading={loadingPlan === plan.name}
                    onClick={() => handleUpgrade(plan.name)}
                  >
                    {isCurrentPlan ? (
                      "Current Plan"
                    ) : isDowngrade ? (
                      "Downgrade"
                    ) : (
                      "Upgrade"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
    </motion.div>
  );
}
