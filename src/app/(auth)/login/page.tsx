import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In | TradeMind AI Journal",
  description: "Sign in to your TradeMind trading journal account.",
};

export default function LoginPage() {
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return <LoginForm googleEnabled={googleEnabled} />;
}
