"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import type { EmotionBefore, EmotionAfter } from "@/types/behavioral";
import { EMOTION_BEFORE_LABELS, EMOTION_AFTER_LABELS } from "@/types/behavioral";

interface EmotionSliderProps {
  label: string;
  emoji: string;
  value: number;
  min?: number;
  max?: number;
  isNegative: boolean;
  onChange: (value: number) => void;
}

function EmotionSlider({ label, emoji, value, min = 0, max = 10, isNegative, onChange }: EmotionSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const color = isNegative
    ? value >= 7 ? "bg-accent-red" : value >= 4 ? "bg-accent-yellow" : "bg-white/20"
    : value >= 7 ? "bg-accent-green" : value >= 4 ? "bg-primary" : "bg-white/20";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {emoji} {label}
        </span>
        <span className={cn(
          "text-xs font-mono font-semibold tabular-nums",
          isNegative
            ? value >= 7 ? "text-accent-red" : value >= 4 ? "text-accent-yellow" : "text-muted-foreground"
            : value >= 7 ? "text-accent-green" : value >= 4 ? "text-primary-300" : "text-muted-foreground"
        )}>
          {value}/{max}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-white/[0.04] overflow-hidden border border-white/[0.04]">
        <motion.div
          className={cn("absolute inset-y-0 left-0 rounded-full", color)}
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={spring.snappy}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 appearance-none bg-transparent cursor-pointer -mt-2 relative z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing"
      />
    </div>
  );
}

// ─── Before Trade Panel ──────────────────────────────────────

interface EmotionBeforeInputProps {
  value: EmotionBefore;
  onChange: (value: EmotionBefore) => void;
}

export function EmotionBeforeInput({ value, onChange }: EmotionBeforeInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <h4 className="text-sm font-semibold">Pre-Trade State</h4>
        <span className="text-[10px] text-muted-foreground/60 font-mono ml-auto">before entry</span>
      </div>
      <div className="grid gap-3">
        {(Object.keys(EMOTION_BEFORE_LABELS) as Array<keyof EmotionBefore>).map((key) => {
          const meta = EMOTION_BEFORE_LABELS[key];
          return (
            <EmotionSlider
              key={key}
              label={meta.label}
              emoji={meta.emoji}
              value={value[key]}
              isNegative={meta.isNegative}
              onChange={(v) => onChange({ ...value, [key]: v })}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── After Trade Panel ───────────────────────────────────────

interface EmotionAfterInputProps {
  value: EmotionAfter;
  onChange: (value: EmotionAfter) => void;
}

export function EmotionAfterInput({ value, onChange }: EmotionAfterInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-accent-yellow" />
        <h4 className="text-sm font-semibold">Post-Trade State</h4>
        <span className="text-[10px] text-muted-foreground/60 font-mono ml-auto">after exit</span>
      </div>
      <div className="grid gap-3">
        {(Object.keys(EMOTION_AFTER_LABELS) as Array<keyof EmotionAfter>).map((key) => {
          const meta = EMOTION_AFTER_LABELS[key];
          return (
            <EmotionSlider
              key={key}
              label={meta.label}
              emoji={meta.emoji}
              value={value[key]}
              min={key === "confidenceShift" ? -5 : 0}
              max={key === "confidenceShift" ? 5 : 10}
              isNegative={meta.isNegative}
              onChange={(v) => onChange({ ...value, [key]: v })}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Context Metadata ────────────────────────────────────────

interface ContextInputProps {
  confidenceLevel: number;
  sleepQuality: number;
  fatigueLevel: number;
  onConfidenceChange: (v: number) => void;
  onSleepChange: (v: number) => void;
  onFatigueChange: (v: number) => void;
}

export function ContextMetadataInput({
  confidenceLevel, sleepQuality, fatigueLevel,
  onConfidenceChange, onSleepChange, onFatigueChange,
}: ContextInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-accent-green" />
        <h4 className="text-sm font-semibold">Trader Context</h4>
      </div>
      <div className="grid gap-3">
        <EmotionSlider
          label="Confidence"
          emoji="💪"
          value={confidenceLevel}
          min={1}
          max={10}
          isNegative={false}
          onChange={onConfidenceChange}
        />
        <EmotionSlider
          label="Sleep Quality"
          emoji="😴"
          value={sleepQuality}
          min={1}
          max={5}
          isNegative={false}
          onChange={onSleepChange}
        />
        <EmotionSlider
          label="Fatigue"
          emoji="😩"
          value={fatigueLevel}
          min={1}
          max={5}
          isNegative={true}
          onChange={onFatigueChange}
        />
      </div>
    </div>
  );
}
