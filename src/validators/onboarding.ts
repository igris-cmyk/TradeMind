import { z } from "zod";

export const onboardingSchema = z.object({
  tradingStyle: z.enum(["Scalper", "Day Trader", "Swing Trader", "Position Trader"]),
  markets: z.array(z.enum(["Forex", "Crypto", "Options", "Futures", "Stocks"])).min(1, "Select at least one market"),
  experience: z.enum(["Beginner", "Intermediate", "Advanced"]),
  strategies: z.array(z.string()).min(1, "Select at least one strategy"),
  goals: z.array(z.string()).min(1, "Select at least one goal"),
  sessions: z.array(z.enum(["Asian", "London", "NY AM", "NY PM"])).min(1, "Select at least one session"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
