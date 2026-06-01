import { prisma } from "@/lib/prisma";

export const PREMIUM_PLANS = ["PRO", "ELITE"] as const;

export type PremiumPlan = (typeof PREMIUM_PLANS)[number];

export async function getUserEntitlements(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      plan: true,
      onboardingProfile: { select: { id: true } },
      subscription: {
        select: {
          status: true,
          currentPeriodEnd: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    userId: user.id,
    plan: user.plan,
    onboardingComplete: Boolean(user.onboardingProfile),
    subscriptionStatus: user.subscription?.status ?? null,
    subscriptionCurrentPeriodEnd: user.subscription?.currentPeriodEnd ?? null,
    hasPremiumAccess: PREMIUM_PLANS.includes(user.plan as PremiumPlan),
  };
}

export async function hasPremiumAccess(userId: string) {
  const entitlements = await getUserEntitlements(userId);
  return Boolean(entitlements?.hasPremiumAccess);
}
