"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, BookOpen, SmilePlus } from "lucide-react";
import { useJournalEntries, useCreateJournalEntry, useDeleteJournalEntry } from "@/hooks/use-queries";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { fadeUp, spring, stagger } from "@/lib/motion";

const MOODS = [
  { label: "Great", emoji: "🟢", value: "great" },
  { label: "Good", emoji: "🔵", value: "good" },
  { label: "Neutral", emoji: "🟡", value: "neutral" },
  { label: "Bad", emoji: "🟠", value: "bad" },
  { label: "Terrible", emoji: "🔴", value: "terrible" },
];

export default function JournalPage() {
  const [page] = useState(1);
  const { data, isLoading } = useJournalEntries({ page: String(page) });
  const createEntry = useCreateJournalEntry();
  const deleteEntry = useDeleteJournalEntry();

  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");

  const handleCreate = async () => {
    if (!content.trim()) return;
    await createEntry.mutateAsync({ content, mood: mood || undefined });
    setContent("");
    setMood("");
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton variant="text" className="h-7 w-32" />
        <LoadingSkeleton variant="card" count={3} className="h-28" />
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-5"
      variants={stagger.container(0.06)}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Journal</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Record your thoughts, emotions, and daily reflections
          </p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-3.5 w-3.5" />
          New Entry
        </Button>
      </motion.div>

      {/* Create Form */}
      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, overflow: "hidden" }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
            transition={spring.gentle}
          >
            <Card className="glass-card mb-4">
              <CardContent className="p-4 space-y-4">
                {/* Mood selector */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <SmilePlus className="h-3.5 w-3.5" />
                    How are you feeling?
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setMood(mood === m.value ? "" : m.value)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200",
                          mood === m.value
                            ? "border-primary/20 bg-primary/10 text-primary-300 shadow-glow-sm"
                            : "border-white/[0.04] bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]"
                        )}
                      >
                        <span className="text-base">{m.emoji}</span>
                        <span className="text-xs font-medium text-foreground">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Journal Entry</Label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind? Reflect on today's trading execution, mental state, rules applied, errors, and lessons..."
                    className="flex w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:outline-none focus:ring-1 focus:ring-primary min-h-[96px] resize-y"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button size="sm" className="text-xs" onClick={handleCreate} loading={createEntry.isPending} disabled={!content.trim()}>
                    Save Entry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries */}
      {!data?.entries?.length ? (
        <EmptyState
          icon={BookOpen}
          title="No reflections yet"
          description="Start journaling to connect emotional self-awareness with objective performance data."
          actionLabel="Write First Entry"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <motion.div variants={fadeUp} className="space-y-3">
          <AnimatePresence mode="popLayout">
            {data.entries.map((entry: Record<string, unknown>) => {
              const moodData = MOODS.find((m) => m.value === entry.mood);
              const trade = entry.trade as Record<string, unknown> | null;
              return (
                <motion.div
                  key={entry.id as string}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                  transition={spring.gentle}
                >
                  <Card className="glass-card hover:border-white/[0.12] transition-all group">
                    <CardHeader className="pb-2 flex-row justify-between items-start space-y-0 p-4">
                      <div className="flex items-center gap-3">
                        {moodData && (
                          <div className="h-8 w-8 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-sm shadow-inner-highlight">
                            {moodData.emoji}
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-xs font-semibold text-foreground">
                            {new Date(entry.createdAt as string).toLocaleDateString("en-US", {
                              weekday: "long", month: "short", day: "numeric"
                            })}
                          </CardTitle>
                          {trade && (
                            <span className="text-[10px] text-muted-foreground font-medium block">
                              Linked Trade: {trade.pair as string} ({trade.direction as string})
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-accent-red"
                        onClick={() => deleteEntry.mutate(entry.id as string)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {entry.content as string}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
