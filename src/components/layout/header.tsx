"use client";

import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

const routeNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/trades": "Trades",
  "/trades/new": "Log Trade",
  "/analytics": "Analytics",
  "/journal": "Journal",
  "/psychology": "Psychology",
  "/strategies": "Strategies",
  "/settings": "Settings",
  "/settings/pricing": "Pricing",
};

export function Header() {
  const { user, isLoading } = useCurrentUser();
  const pathname = usePathname();

  const pageName = routeNames[pathname] || 
    Object.entries(routeNames).find(([route]) => pathname.startsWith(route))?.[1] ||
    "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.04] bg-background/70 backdrop-blur-[12px] px-4 lg:px-6">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold lg:hidden gradient-text">TradeMind</h2>
        <div className="hidden lg:flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">TradeMind</span>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-medium text-foreground">{pageName}</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Cmd+K Search Trigger */}
        <button 
          className="hidden sm:flex items-center justify-between h-9 w-64 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 text-sm text-muted-foreground shadow-sm hover:bg-white/[0.04] hover:text-foreground transition-all focus:outline-none"
          onClick={() => {
            // Dispatch Cmd+K to open command palette
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
          }}
        >
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4 opacity-70" />
            <span className="font-medium mt-0.5">Search...</span>
          </span>
          <kbd className="inline-flex h-5 items-center justify-center rounded bg-white/[0.05] px-1.5 font-mono text-[10px] font-medium border border-white/[0.08] text-muted-foreground/80">
            ⌘K
          </kbd>
        </button>

        {/* User */}
        {isLoading ? (
          <LoadingSkeleton variant="avatar" className="h-8 w-8" />
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-medium text-foreground leading-tight">{user?.name || "Trader"}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user?.plan?.toLowerCase() || "free"}</p>
            </div>
            <Avatar className="h-8 w-8 border border-white/[0.06]">
              <AvatarImage src={user?.image || ""} alt={user?.name || "Avatar"} />
              <AvatarFallback className="bg-primary/10 text-primary-300 text-xs font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || "T"}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </header>
  );
}
