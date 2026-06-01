"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, Compass, LineChart, Target, Settings, Plus, BookOpen, Brain, Sparkles, Shield, Keyboard, PenLine } from "lucide-react";
import { JournalQuickEntry } from "@/components/journal/journal-quick-entry";
import { usePrefetchRoutes } from "@/hooks/use-prefetch";
import { spring } from "@/lib/motion";
import { motion, AnimatePresence } from "framer-motion";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { prefetchByHref } = usePrefetchRoutes();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
    <JournalQuickEntry trigger={<button id="journal-quick-trigger" className="hidden" aria-hidden />} />
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={spring.snappy}
            className="relative z-50 w-full max-w-xl shadow-2xl"
          >
            <Command
              className="glass-card-elevated overflow-hidden rounded-xl border border-white/[0.08]"
              label="Global Command Menu"
              loop
            >
              <div className="flex items-center border-b border-white/[0.06] px-4">
                <Search className="mr-3 h-4 w-4 shrink-0 text-muted-foreground/70" />
                <Command.Input
                  autoFocus
                  className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm font-medium outline-none placeholder:text-muted-foreground/50 placeholder:font-normal"
                  placeholder="Type a command or search..."
                />
              </div>

              <Command.List className="max-h-[320px] overflow-y-auto overflow-x-hidden p-2">
                <Command.Empty className="py-8 text-center text-[13px] text-muted-foreground">
                  No results found.
                </Command.Empty>

                <Command.Group
                  heading="Quick Actions"
                  className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest"
                >
                  <Command.Item
                    className="relative flex cursor-default select-none items-center rounded-lg px-3 py-2.5 text-[13px] font-medium outline-none transition-colors aria-selected:bg-white/[0.06] aria-selected:text-foreground text-muted-foreground mt-0.5"
                    onSelect={() => runCommand(() => router.push("/trades/new"))}
                  >
                    <Plus className="mr-3 h-[18px] w-[18px] text-primary-400" />
                    <span>Log a new trade</span>
                    <kbd className="ml-auto text-[9px] font-mono text-muted-foreground/50">N</kbd>
                  </Command.Item>
                  <Command.Item
                    className="relative flex cursor-default select-none items-center rounded-lg px-3 py-2.5 text-[13px] font-medium outline-none transition-colors aria-selected:bg-white/[0.06] aria-selected:text-foreground text-muted-foreground mt-0.5"
                    onSelect={() => runCommand(() => router.push("/psychology"))}
                  >
                    <Shield className="mr-3 h-[18px] w-[18px] text-accent-green" />
                    <span>View discipline score</span>
                  </Command.Item>
                  <Command.Item
                    className="relative flex cursor-default select-none items-center rounded-lg px-3 py-2.5 text-[13px] font-medium outline-none transition-colors aria-selected:bg-white/[0.06] aria-selected:text-foreground text-muted-foreground mt-0.5"
                    onSelect={() => runCommand(() => {
                      setOpen(false);
                      document.getElementById("journal-quick-trigger")?.click();
                    })}
                  >
                    <PenLine className="mr-3 h-[18px] w-[18px] text-primary-400" />
                    <span>Quick journal entry</span>
                    <kbd className="ml-auto text-[9px] font-mono text-muted-foreground/50">J</kbd>
                  </Command.Item>
                </Command.Group>

                <Command.Group
                  heading="Navigation"
                  className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mt-1.5"
                >
                  {[
                    { icon: Compass, label: "Dashboard", href: "/dashboard" },
                    { icon: LineChart, label: "Trades History", href: "/trades" },
                    { icon: Sparkles, label: "Analytics", href: "/analytics" },
                    { icon: BookOpen, label: "Journal", href: "/journal" },
                    { icon: Brain, label: "Psychology", href: "/psychology" },
                    { icon: Target, label: "Strategies", href: "/strategies" },
                    { icon: Settings, label: "Settings", href: "/settings" },
                  ].map((item) => (
                    <Command.Item
                      key={item.href}
                      className="relative flex cursor-default select-none items-center rounded-lg px-3 py-2.5 text-[13px] font-medium outline-none transition-colors aria-selected:bg-white/[0.06] aria-selected:text-foreground text-muted-foreground mt-0.5"
                      onSelect={() => runCommand(() => router.push(item.href))}
                      onMouseEnter={() => prefetchByHref(item.href)}
                    >
                      <item.icon className="mr-3 h-[18px] w-[18px] text-muted-foreground/70" />
                      <span>{item.label}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
                <Command.Group
                  heading="Shortcuts"
                  className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mt-1.5"
                >
                  <Command.Item
                    className="relative flex cursor-default select-none items-center rounded-lg px-3 py-2.5 text-[13px] font-medium outline-none text-muted-foreground/60 mt-0.5"
                    disabled
                  >
                    <Keyboard className="mr-3 h-[18px] w-[18px]" />
                    <span>⌘K palette · N new trade · 1–6 nav</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>

              <div className="border-t border-white/[0.04] bg-white/[0.01] px-4 py-2.5 flex items-center justify-between text-[10px] text-muted-foreground/40 font-medium">
                <span className="flex items-center gap-1.5">
                  Navigate with <kbd className="font-mono text-[9px] px-1 bg-white/[0.05] border border-white/[0.08] rounded">↑↓</kbd> · Select with <kbd className="font-mono text-[9px] px-1 bg-white/[0.05] border border-white/[0.08] rounded">↵</kbd>
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="font-mono text-[9px] px-1 bg-white/[0.05] border border-white/[0.08] rounded">ESC</kbd> to close
                </span>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}
