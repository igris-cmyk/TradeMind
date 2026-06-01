import { z } from "zod";

export const FOREX_PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "NZD/USD", "USD/CAD",
  "EUR/GBP", "EUR/JPY", "GBP/JPY", "AUD/JPY", "EUR/AUD", "EUR/CHF", "GBP/CHF",
  "EUR/CAD", "GBP/AUD", "GBP/CAD", "GBP/NZD", "AUD/CAD", "AUD/NZD",
  "NZD/JPY", "NZD/CAD", "CHF/JPY", "CAD/JPY",
] as const;

export const CRYPTO_PAIRS = [
  "BTC/USD", "ETH/USD", "BNB/USD", "SOL/USD", "XRP/USD", "ADA/USD",
  "DOGE/USD", "AVAX/USD", "DOT/USD", "MATIC/USD", "LINK/USD", "UNI/USD",
  "BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT",
] as const;

export const INDICES = [
  "US30", "US100", "US500", "GER40", "UK100", "JPN225", "AUS200",
  "FRA40", "EU50", "HK50",
] as const;

export const COMMODITIES = [
  "XAUUSD", "XAGUSD", "USOIL", "UKOIL", "NATGAS",
] as const;

export const ALL_SYMBOLS = [
  ...FOREX_PAIRS, ...CRYPTO_PAIRS, ...INDICES, ...COMMODITIES,
] as const;

export const STRATEGY_TAGS = [
  "Breaker Block",
  "FVG",
  "Liquidity Sweep",
  "MSS",
  "SMT Divergence",
  "Mitigation Block",
  "Order Block",
  "IFVG",
] as const;

export const EMOTIONS = [
  "Fearful",
  "Revenge Trading",
  "Overconfident",
  "Disciplined",
  "Anxious",
  "Calm",
  "Impulsive",
] as const;

export const SESSIONS = ["Asian", "London", "NY AM", "NY PM"] as const;

export const createTradeSchema = z.object({
  pair: z.string().min(1, "Symbol/pair is required"),
  direction: z.enum(["LONG", "SHORT"]),
  entry: z.number().positive("Entry price must be positive"),
  stopLoss: z.number().positive("Stop loss must be positive"),
  takeProfit: z.number().positive("Take profit must be positive"),
  riskPercent: z.number().min(0).max(100).optional(),
  riskAmount: z.number().min(0).optional(),
  session: z.enum(SESSIONS).optional(),
  strategyTags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  emotions: z.array(z.string()).optional(),
  screenshots: z.array(z.string()).optional(),
  pnl: z.number().optional(),
  rrAchieved: z.number().optional(),
  status: z.enum(["WIN", "LOSS", "BREAKEVEN", "OPEN"]).optional(),
  // Phase 2: Behavioral Intelligence
  emotionBefore: z.object({
    confidence: z.number().min(0).max(10),
    fear: z.number().min(0).max(10),
    greed: z.number().min(0).max(10),
    revenge: z.number().min(0).max(10),
    impulsiveness: z.number().min(0).max(10),
    calmness: z.number().min(0).max(10),
    hesitation: z.number().min(0).max(10),
    focus: z.number().min(0).max(10),
  }).optional(),
  emotionAfter: z.object({
    satisfaction: z.number().min(0).max(10),
    frustration: z.number().min(0).max(10),
    regret: z.number().min(0).max(10),
    emotionalExhaustion: z.number().min(0).max(10),
    confidenceShift: z.number().min(-5).max(5),
    disappointment: z.number().min(0).max(10),
  }).optional(),
  marketContext: z.object({
    volatility: z.enum(["low", "medium", "high", "extreme"]),
    marketCondition: z.enum(["trending", "ranging", "choppy", "breakout", "reversal"]),
    newsProximity: z.boolean(),
    sessionType: z.string(),
  }).optional(),
  confidenceLevel: z.number().min(1).max(10).optional(),
  sleepQuality: z.number().min(1).max(5).optional(),
  fatigueLevel: z.number().min(1).max(5).optional(),
});

export const updateTradeSchema = createTradeSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateTradeInput = z.infer<typeof createTradeSchema>;
export type UpdateTradeInput = z.infer<typeof updateTradeSchema>;
