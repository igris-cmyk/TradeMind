"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { TrendingUp, Brain, BarChart3, Shield, ArrowRight, Sparkles, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { spring } from "@/lib/motion";

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={spring.gentle}
      className="text-3xl sm:text-4xl font-bold font-mono tabular-nums gradient-text"
    >
      {isInView ? `${value.toLocaleString()}${suffix}` : "0"}
    </motion.span>
  );
}

const features = [
  {
    icon: TrendingUp,
    title: "Trade Analytics",
    description: "Track win rates, P&L, R:R ratios, equity curves, and performance by session, pair, and strategy.",
  },
  {
    icon: Brain,
    title: "AI Trading Coach",
    description: "GPT-4 analyses your trades, detects emotional patterns, identifies mistakes, and gives actionable coaching.",
  },
  {
    icon: BarChart3,
    title: "Psychology Tracking",
    description: "Correlate your mental state with performance. Build discipline through data-driven emotional awareness.",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Auto-calculate position sizes, track risk per trade, and get alerts for overleveraging or FOMO.",
  },
];

const stats = [
  { label: "Trades Analysed", value: 50000, suffix: "+" },
  { label: "Win Rate Improvement", value: 23, suffix: "%" },
  { label: "Active Traders", value: 2400, suffix: "+" },
];

const benefits = [
  "Unlimited trade logging",
  "AI-powered performance analysis",
  "Emotion & psychology tracking",
  "CSV import & export",
  "Interactive equity curves",
  "Real-time session analytics",
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute w-[800px] h-[800px] -top-[400px] -left-[200px] rounded-full opacity-[0.09] animate-glow-pulse"
          style={{ background: "radial-gradient(circle, #6366F1, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.4) 0%, transparent 55%)`,
          }}
        />
        <div className="absolute w-[600px] h-[600px] top-[40%] -right-[200px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #10B981, transparent 70%)" }}
        />
        <div className="absolute w-[400px] h-[400px] bottom-0 left-[30%] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #6366F1, transparent 70%)" }}
        />
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 lg:px-16 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
            <Sparkles className="h-4 w-4 text-primary-400" />
          </div>
          <span className="text-base font-semibold gradient-text tracking-tight">TradeMind</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="text-xs">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section ref={heroRef} className="relative flex flex-col items-center text-center px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="max-w-4xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={spring.gentle}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/8 border border-primary/15 text-primary-300 text-xs font-medium mb-8"
            >
              <Zap className="h-3 w-3" />
              AI-Powered Trading Journal
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring.gentle, delay: 0.1 }}
              className="type-display lg:text-6xl"
            >
              Stop losing money to{" "}
              <span className="gradient-text">emotional trades</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring.gentle, delay: 0.2 }}
              className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              TradeMind uses AI to analyse your trading patterns, detect psychological mistakes, 
              and coach you toward consistent profitability. Your personal trading psychologist that never sleeps.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring.gentle, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-3 mt-8"
            >
              <Link href="/register">
                <Button size="lg" variant="glow" className="gap-2 text-sm">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-sm">
                  Sign in to Dashboard
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="px-6 lg:px-16 pb-20">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring.gentle, delay: i * 0.1 }}
                className="text-center"
              >
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="px-6 lg:px-16 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={spring.gentle}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Everything you need to{" "}
              <span className="gradient-text">trade better</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm">
              Built by traders, for traders. Every feature is designed to improve your decision-making.
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring.gentle, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="glass-card p-5 rounded-xl group cursor-default"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 mb-4 group-hover:bg-primary/12 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary-400" />
                </div>
                <h3 className="text-sm font-semibold mb-1.5">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-6 lg:px-16 pb-20">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={spring.gentle}
            className="text-2xl font-bold text-center mb-10 tracking-tight"
          >
            Traders who <span className="gradient-text">leveled up</span>
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              { name: "Marcus T.", role: "Forex scalper", quote: "TradeMind caught my revenge trading pattern before it blew my week. The discipline score keeps me honest." },
              { name: "Sarah K.", role: "Prop firm trader", quote: "Finally a journal that feels like a Bloomberg terminal, not a Notion clone. Keyboard shortcuts alone save 20 min/day." },
              { name: "Alex R.", role: "Swing trader", quote: "Session recaps and emotion tagging changed how I review trades. Win rate up 18% in 90 days." },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ ...spring.gentle, delay: i * 0.08 }}
                className="glass-card p-5 rounded-xl"
              >
                <p className="text-sm text-foreground/90 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-xs font-semibold">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Social proof */}
        <section className="px-6 lg:px-16 pb-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 text-muted-foreground/60"
          >
            {["Prop firm traders", "Forex scalpers", "Swing traders", "Futures desks"].map(
              (label, i) => (
                <motion.span
                  key={label}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="text-xs font-medium tracking-wide"
                >
                  {label}
                </motion.span>
              )
            )}
          </motion.div>
        </section>

        {/* Benefits */}
        <section className="px-6 lg:px-16 pb-24">
          <div className="max-w-3xl mx-auto glass-card p-8 sm:p-12 rounded-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={spring.gentle}
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2">Ready to transform your trading?</h2>
              <p className="text-muted-foreground text-sm mb-8">
                Join thousands of traders who have improved their consistency with TradeMind.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 text-left mb-8 max-w-md mx-auto">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ ...spring.gentle, delay: i * 0.05 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-accent-green shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </motion.div>
                ))}
              </div>
              <Link href="/register">
                <Button size="lg" variant="glow" className="gap-2 text-sm">
                  Start Your Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/[0.04] py-6 px-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TradeMind AI Journal. Built for traders, by traders.
          </p>
        </footer>
      </main>
    </div>
  );
}
