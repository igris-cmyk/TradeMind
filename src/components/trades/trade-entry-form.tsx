"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Search,
  Loader2,
} from "lucide-react";

import { createTradeSchema, type CreateTradeInput, ALL_SYMBOLS, STRATEGY_TAGS, EMOTIONS, SESSIONS } from "@/validators/trade";
import { useCreateTrade } from "@/hooks/use-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/shared/file-upload";
import { cn } from "@/lib/utils";
import { saveTradeDraft, loadTradeDraft, clearTradeDraft } from "@/lib/trade-draft";
import { EmotionBeforeInput, EmotionAfterInput, ContextMetadataInput } from "@/components/psychology/emotion-input";
import { DEFAULT_EMOTION_BEFORE, DEFAULT_EMOTION_AFTER } from "@/types/behavioral";

export function TradeEntryForm() {
  const router = useRouter();
  const createTrade = useCreateTrade();
  const [symbolSearch, setSymbolSearch] = useState("");
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTradeInput>({
    resolver: zodResolver(createTradeSchema),
    defaultValues: {
      direction: "LONG",
      strategyTags: [],
      emotions: [],
      screenshots: [],
      status: "OPEN",
      emotionBefore: DEFAULT_EMOTION_BEFORE,
      emotionAfter: DEFAULT_EMOTION_AFTER,
      confidenceLevel: 5,
      sleepQuality: 3,
      fatigueLevel: 3,
    },
  });

  const entry = watch("entry");
  const stopLoss = watch("stopLoss");
  const takeProfit = watch("takeProfit");
  const direction = watch("direction");
  const selectedStrategies = watch("strategyTags") || [];
  const selectedEmotions = watch("emotions") || [];
  
  const emotionBefore = watch("emotionBefore") || DEFAULT_EMOTION_BEFORE;
  const emotionAfter = watch("emotionAfter") || DEFAULT_EMOTION_AFTER;
  const confidenceLevel = watch("confidenceLevel") || 5;
  const sleepQuality = watch("sleepQuality") || 3;
  const fatigueLevel = watch("fatigueLevel") || 3;

  // Live R:R calculation
  const rrCalc = useMemo(() => {
    if (!entry || !stopLoss || !takeProfit) return null;
    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(takeProfit - entry);
    if (risk === 0) return null;
    return {
      rr: Math.round((reward / risk) * 100) / 100,
      riskPips: Math.round(risk * 10000) / 10000,
      rewardPips: Math.round(reward * 10000) / 10000,
    };
  }, [entry, stopLoss, takeProfit]);

  // Symbol autocomplete
  const filteredSymbols = useMemo(() => {
    if (!symbolSearch) return ALL_SYMBOLS.slice(0, 12);
    return ALL_SYMBOLS.filter((s) =>
      s.toLowerCase().includes(symbolSearch.toLowerCase())
    ).slice(0, 8);
  }, [symbolSearch]);

  const toggleArrayItem = useCallback(
    (field: "strategyTags" | "emotions", item: string) => {
      const current = (watch(field) as string[]) || [];
      const updated = current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item];
      setValue(field, updated);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setValue, watch]
  );

  useEffect(() => {
    const draft = loadTradeDraft();
    if (draft?.pair) setValue("pair", draft.pair);
    if (draft?.direction) setValue("direction", draft.direction as "LONG" | "SHORT");
    if (draft?.entry) setValue("entry", draft.entry);
    if (draft?.stopLoss) setValue("stopLoss", draft.stopLoss);
    if (draft?.takeProfit) setValue("takeProfit", draft.takeProfit);
    if (draft?.notes) setValue("notes", draft.notes);
    if (draft?.emotions?.length) setValue("emotions", draft.emotions);
  }, [setValue]);

  useEffect(() => {
    const sub = watch((values) => {
      saveTradeDraft({
        pair: values.pair,
        direction: values.direction,
        entry: values.entry,
        stopLoss: values.stopLoss,
        takeProfit: values.takeProfit,
        notes: values.notes,
        emotions: values.emotions,
      });
    });
    return () => sub.unsubscribe();
  }, [watch]);

  const onSubmit = useCallback(async (data: CreateTradeInput) => {
    if (data.entry && data.stopLoss && data.takeProfit) {
      const risk = Math.abs(data.entry - data.stopLoss);
      const reward = Math.abs(data.takeProfit - data.entry);
      if (risk > 0) {
        data.rrAchieved = Math.round((reward / risk) * 100) / 100;
      }
    }

    await createTrade.mutateAsync(data);
    clearTradeDraft();
    router.push("/trades");
  }, [createTrade, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName === "TEXTAREA") return;

      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        void handleSubmit(onSubmit)();
        return;
      }
      if (e.altKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setValue("direction", "LONG");
      }
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setValue("direction", "SHORT");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleSubmit, onSubmit, setValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column — Main Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pair & Direction */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Trade Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Symbol Autocomplete */}
                <div className="space-y-2">
                  <Label>Symbol / Pair</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Controller
                      name="pair"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Search EUR/USD, BTC/USD..."
                          className="pl-9"
                          value={field.value || symbolSearch}
                          onChange={(e) => {
                            setSymbolSearch(e.target.value);
                            field.onChange(e.target.value);
                            setShowSymbolDropdown(true);
                          }}
                          onFocus={() => setShowSymbolDropdown(true)}
                          onBlur={() => setTimeout(() => setShowSymbolDropdown(false), 200)}
                        />
                      )}
                    />
                    {showSymbolDropdown && filteredSymbols.length > 0 && (
                      <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredSymbols.map((symbol) => (
                          <button
                            key={symbol}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                            onMouseDown={() => {
                              setValue("pair", symbol);
                              setSymbolSearch(symbol);
                              setShowSymbolDropdown(false);
                            }}
                          >
                            {symbol}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.pair && (
                    <p className="text-xs text-accent-red">{errors.pair.message}</p>
                  )}
                </div>

                {/* Direction Toggle */}
                <div className="space-y-2">
                  <Label>Direction</Label>
                  <Controller
                    name="direction"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => field.onChange("LONG")}
                          className={cn(
                            "flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-sm font-semibold transition-all",
                            field.value === "LONG"
                              ? "border-accent-green bg-accent-green/10 text-accent-green shadow-glow-green"
                              : "border-border text-muted-foreground hover:border-white/20"
                          )}
                        >
                          <ArrowUpRight className="h-5 w-5" />
                          LONG
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange("SHORT")}
                          className={cn(
                            "flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-sm font-semibold transition-all",
                            field.value === "SHORT"
                              ? "border-accent-red bg-accent-red/10 text-accent-red shadow-glow-red"
                              : "border-border text-muted-foreground hover:border-white/20"
                          )}
                        >
                          <ArrowDownRight className="h-5 w-5" />
                          SHORT
                        </button>
                      </div>
                    )}
                  />
                </div>

                {/* Price Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Entry Price</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="1.0850"
                      {...register("entry", { valueAsNumber: true })}
                    />
                    {errors.entry && (
                      <p className="text-xs text-accent-red">{errors.entry.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Stop Loss</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="1.0800"
                      {...register("stopLoss", { valueAsNumber: true })}
                    />
                    {errors.stopLoss && (
                      <p className="text-xs text-accent-red">{errors.stopLoss.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Take Profit</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="1.0950"
                      {...register("takeProfit", { valueAsNumber: true })}
                    />
                    {errors.takeProfit && (
                      <p className="text-xs text-accent-red">{errors.takeProfit.message}</p>
                    )}
                  </div>
                </div>

                {/* Risk Management */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Risk %</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="1.0"
                      {...register("riskPercent", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Risk Amount ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="100.00"
                      {...register("riskAmount", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                {/* Session */}
                <div className="space-y-2">
                  <Label>Session</Label>
                  <Controller
                    name="session"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SESSIONS.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => field.onChange(field.value === s ? undefined : s)}
                            className={cn(
                              "py-2 rounded-lg border text-xs font-medium transition-all",
                              field.value === s
                                ? "border-primary bg-primary/10 text-primary-300"
                                : "border-border text-muted-foreground hover:border-white/20"
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </div>

                {/* P&L and Status (for closed trades) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>P&L ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register("pnl", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {(["OPEN", "WIN", "LOSS", "BREAKEVEN"] as const).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => field.onChange(s)}
                              className={cn(
                                "py-2 rounded-lg border text-xs font-medium transition-all",
                                field.value === s
                                  ? s === "WIN"
                                    ? "border-accent-green bg-accent-green/10 text-accent-green"
                                    : s === "LOSS"
                                    ? "border-accent-red bg-accent-red/10 text-accent-red"
                                    : "border-primary bg-primary/10 text-primary-300"
                                  : "border-border text-muted-foreground hover:border-white/20"
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategy Tags */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Strategy & Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Strategy Tags (ICT Concepts)</Label>
                  <div className="flex flex-wrap gap-2">
                    {STRATEGY_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleArrayItem("strategyTags", tag)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                          selectedStrategies.includes(tag)
                            ? "border-primary bg-primary/15 text-primary-300"
                            : "border-border text-muted-foreground hover:border-white/20"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Psychology & Context */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Behavioral Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Context */}
                <ContextMetadataInput
                  confidenceLevel={confidenceLevel}
                  sleepQuality={sleepQuality}
                  fatigueLevel={fatigueLevel}
                  onConfidenceChange={(v) => setValue("confidenceLevel", v)}
                  onSleepChange={(v) => setValue("sleepQuality", v)}
                  onFatigueChange={(v) => setValue("fatigueLevel", v)}
                />

                <div className="h-px bg-border/50" />

                {/* Pre-trade */}
                <EmotionBeforeInput
                  value={emotionBefore}
                  onChange={(v) => setValue("emotionBefore", v)}
                />

                <div className="h-px bg-border/50" />

                {/* Post-trade (only if closed or partial) */}
                {watch("status") !== "OPEN" && (
                  <>
                    <EmotionAfterInput
                      value={emotionAfter}
                      onChange={(v) => setValue("emotionAfter", v)}
                    />
                    <div className="h-px bg-border/50" />
                  </>
                )}

                <div className="space-y-2">
                  <Label>Quick Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {EMOTIONS.map((emotion) => {
                      const isNegative = ["Fearful", "Revenge Trading", "Overconfident", "Anxious", "Impulsive"].includes(emotion);
                      return (
                        <button
                          key={emotion}
                          type="button"
                          onClick={() => toggleArrayItem("emotions", emotion)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                            selectedEmotions.includes(emotion)
                              ? isNegative
                                ? "border-accent-red bg-accent-red/15 text-accent-red"
                                : "border-accent-green bg-accent-green/15 text-accent-green"
                              : "border-border text-muted-foreground hover:border-white/20"
                          )}
                        >
                          {emotion}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Trade Notes</Label>
                  <textarea
                    {...register("notes")}
                    placeholder="Describe your analysis, entry reasoning, market conditions..."
                    className="flex w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background min-h-[100px] resize-y"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Screenshots */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Screenshots</CardTitle>
              </CardHeader>
              <CardContent>
                <Controller
                  name="screenshots"
                  control={control}
                  render={({ field }) => (
                    <FileUpload
                      endpoint="tradeAttachment"
                      value={field.value || []}
                      onChange={field.onChange}
                    />
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column — R:R Calculator & Submit */}
          <div className="space-y-6">
            {/* R:R Calculator */}
            <Card className="glass-card sticky top-20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary-400" />
                  <CardTitle className="text-lg">R:R Calculator</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {rrCalc ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Risk:Reward</p>
                      <p
                        className={cn(
                          "text-4xl font-bold font-mono",
                          rrCalc.rr >= 2 ? "text-accent-green" : rrCalc.rr >= 1 ? "text-accent-yellow" : "text-accent-red"
                        )}
                      >
                        1:{rrCalc.rr}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-accent-red/10 border border-accent-red/20">
                        <p className="text-[10px] text-accent-red/70 uppercase tracking-wider">Risk</p>
                        <p className="text-lg font-mono font-semibold text-accent-red">
                          {rrCalc.riskPips}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-accent-green/10 border border-accent-green/20">
                        <p className="text-[10px] text-accent-green/70 uppercase tracking-wider">Reward</p>
                        <p className="text-lg font-mono font-semibold text-accent-green">
                          {rrCalc.rewardPips}
                        </p>
                      </div>
                    </div>

                    {/* R:R quality indicator */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            rrCalc.rr >= 3 ? "bg-accent-green w-full" :
                            rrCalc.rr >= 2 ? "bg-accent-green w-3/4" :
                            rrCalc.rr >= 1 ? "bg-accent-yellow w-1/2" :
                            "bg-accent-red w-1/4"
                          )}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {rrCalc.rr >= 3 ? "Excellent" : rrCalc.rr >= 2 ? "Good" : rrCalc.rr >= 1 ? "Fair" : "Poor"}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Enter Entry, SL & TP to see R:R</p>
                  </div>
                )}

                {/* Direction indicator */}
                <div className={cn(
                  "flex items-center justify-center gap-2 py-2 rounded-lg",
                  direction === "LONG" ? "bg-accent-green/10 text-accent-green" : "bg-accent-red/10 text-accent-red"
                )}>
                  {direction === "LONG" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  <span className="text-sm font-semibold">{direction}</span>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={createTrade.isPending}
                >
                  {createTrade.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Log Trade"
                  )}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground/60 font-mono">
                  ⌘↵ save · ⌥L long · ⌥S short
                </p>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
