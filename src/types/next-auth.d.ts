import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      plan: string;
      role: string;
      onboardingComplete: boolean;
      subscriptionStatus: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    plan?: string;
    role?: string;
    onboardingComplete?: boolean;
    subscriptionStatus?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    plan?: string;
    role?: string;
    onboardingComplete?: boolean;
    subscriptionStatus?: string | null;
  }
}
