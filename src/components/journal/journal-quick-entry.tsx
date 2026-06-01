"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCreateJournalEntry } from "@/hooks/use-queries";

const MOODS = ["Calm", "Focused", "Anxious", "Frustrated", "Confident", "FOMO"];

export function JournalQuickEntry({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const create = useCreateJournalEntry();

  const submit = async () => {
    if (!content.trim()) return;
    await create.mutateAsync({ content: content.trim(), mood: mood || undefined });
    setContent("");
    setMood("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <BookOpen className="h-3.5 w-3.5" />
            Quick Journal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Journal Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap gap-1.5">
            {MOODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                  mood === m
                    ? "bg-primary/10 text-primary-300 border-primary/20"
                    : "border-white/[0.06] text-muted-foreground hover:bg-white/[0.03]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="journal-quick">What happened?</Label>
            <textarea
              id="journal-quick"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[100px] rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Session notes, emotions, lessons..."
            />
          </div>
          <Button
            className="w-full"
            variant="glow"
            loading={create.isPending}
            onClick={submit}
            disabled={!content.trim()}
          >
            Save Entry
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
