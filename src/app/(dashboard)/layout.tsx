"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandPalette } from "@/components/shared/command-palette";
import { SessionRecapModal } from "@/components/shared/session-recap-modal";
import { SkipLink } from "@/components/shared/skip-link";
import { usePrefetchRoutes } from "@/hooks/use-prefetch";
import { useKeyboardNav } from "@/hooks/use-keyboard-nav";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useAppStore();
  const { prefetchDashboard } = usePrefetchRoutes();
  useKeyboardNav();

  useEffect(() => {
    prefetchDashboard();
  }, [prefetchDashboard]);

  return (
    <div className="min-h-screen bg-background">
      <SkipLink />
      <CommandPalette />
      <SessionRecapModal />
      <Sidebar />
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300",
          sidebarOpen ? "lg:ml-64" : "lg:ml-[72px]"
        )}
      >
        <Header />
        <main id="main-content" className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
