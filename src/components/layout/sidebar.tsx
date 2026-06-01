"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  Brain,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import { useAppStore } from "@/store/use-app-store";
import { usePrefetchRoutes } from "@/hooks/use-prefetch";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, shortcut: "1" },
  { label: "Trades", href: "/trades", icon: TrendingUp, shortcut: "2" },
  { label: "Analytics", href: "/analytics", icon: BarChart3, shortcut: "3" },
  { label: "Journal", href: "/journal", icon: BookOpen, shortcut: "4" },
  { label: "Psychology", href: "/psychology", icon: Brain, shortcut: "5" },
  { label: "Strategies", href: "/strategies", icon: Sparkles, shortcut: "6" },
];

const bottomItems = [
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const { prefetchByHref } = usePrefetchRoutes();

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 72 }}
        transition={spring.layout}
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40",
          "bg-card/80 backdrop-blur-[20px] border-r border-white/[0.04]",
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-14 px-4 gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 shadow-inner-highlight">
            <Sparkles className="h-4 w-4 text-primary-400" />
          </div>
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <span className="text-base font-semibold gradient-text whitespace-nowrap tracking-tight">
                  TradeMind
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mx-3 h-px bg-white/[0.04]" />

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const navLink = (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => prefetchByHref(item.href)}
              >
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={spring.snappy}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150",
                    isActive
                      ? "bg-primary/10 text-primary-300"
                      : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/15"
                      transition={spring.gentle}
                    />
                  )}
                  <item.icon className={cn("h-[18px] w-[18px] shrink-0 relative z-10", isActive && "text-primary-400")} />
                  <AnimatePresence mode="wait">
                    {sidebarOpen && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden flex items-center justify-between flex-1 relative z-10"
                      >
                        <span className="whitespace-nowrap">{item.label}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );

            if (!sidebarOpen) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                  <TooltipContent side="right">
                    {item.label}
                    <span className="ml-2 text-muted-foreground/60 font-mono text-[10px]">
                      {item.shortcut}
                    </span>
                  </TooltipContent>
                </Tooltip>
              );
            }
            return navLink;
          })}
        </nav>

        {/* Bottom Items */}
        <div className="px-2 pb-3 space-y-0.5">
          <div className="mx-1 mb-2 h-px bg-white/[0.04]" />
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150",
                    isActive
                      ? "bg-primary/10 text-primary-300"
                      : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </div>
              </Link>
            );
          })}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-accent-red/5 hover:text-accent-red transition-colors duration-150 w-full"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <div className="absolute -right-3 top-18">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 rounded-full bg-card border-white/[0.08] shadow-elevation-1 hover:bg-white/[0.06]"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        </div>
      </motion.aside>
    </>
  );
}
