"use client";

import { motion } from "framer-motion";
import { User, CreditCard, ShieldCheck } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fadeUp, stagger } from "@/lib/motion";

export default function SettingsPage() {
  const { user } = useCurrentUser();

  return (
    <motion.div 
      className="space-y-5 max-w-2xl"
      variants={stagger.container(0.06)}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-xs mt-0.5">Manage your account, preferences, and subscriptions</p>
      </motion.div>

      {/* Profile */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-primary-400" />
              <CardTitle className="text-base font-semibold">Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Name</p>
                <p className="text-sm font-medium text-foreground">{user?.name || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Email</p>
                <p className="text-sm font-medium text-foreground">{user?.email || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subscription */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4.5 w-4.5 text-primary-400" />
              <CardTitle className="text-base font-semibold">Subscription</CardTitle>
            </div>
            <CardDescription className="text-xs">Manage your plan and billing options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <div>
                <p className="font-semibold text-sm capitalize text-foreground">{user?.plan?.toLowerCase() || "free"} Plan</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {user?.plan === "FREE" ? "Up to 50 trades/month, standard dashboard" :
                   user?.plan === "PRO" ? "Unlimited trades, full AI analysis, mood correlation" :
                   "Unlimited AI features, prioritization, direct coaching channel"}
                </p>
              </div>
              <Link href="/settings/pricing">
                <Button variant={user?.plan === "FREE" ? "glow" : "outline"} size="sm" className="text-xs">
                  {user?.plan === "FREE" ? "Upgrade" : "Manage"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-primary-400" />
              <CardTitle className="text-base font-semibold">Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your account is secured via standard OAuth provider mechanisms. Password updates and two-factor authentication can be managed directly on your provider account page.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
