import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account | TradeMind AI Journal",
  description: "Create your TradeMind trading journal account and start improving your trading.",
};

export default function RegisterPage() {
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return <RegisterForm googleEnabled={googleEnabled} />;
}
