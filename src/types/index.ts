export type Plan = "FREE" | "PRO" | "ELITE";

export type TradingStyle = "Scalper" | "Day Trader" | "Swing Trader" | "Position Trader";
export type Market = "Forex" | "Crypto" | "Options" | "Futures" | "Stocks";
export type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced";
export type TradingSession = "Asian" | "London" | "NY AM" | "NY PM";
export type TradeDirection = "LONG" | "SHORT";
export type TradeStatus = "WIN" | "LOSS" | "BREAKEVEN" | "OPEN";

export type Emotion =
  | "Fearful"
  | "Revenge Trading"
  | "Overconfident"
  | "Disciplined"
  | "Anxious"
  | "Calm"
  | "Impulsive";

export type StrategyTag =
  | "Breaker Block"
  | "FVG"
  | "Liquidity Sweep"
  | "MSS"
  | "SMT Divergence"
  | "Mitigation Block"
  | "Order Block"
  | "IFVG";

export interface OnboardingData {
  tradingStyle: TradingStyle;
  markets: Market[];
  experience: ExperienceLevel;
  strategies: string[];
  goals: string[];
  sessions: TradingSession[];
}
