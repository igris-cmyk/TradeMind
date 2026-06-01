const DRAFT_KEY = "trademind-trade-draft";

export type TradeDraft = {
  pair?: string;
  direction?: string;
  entry?: number;
  stopLoss?: number;
  takeProfit?: number;
  notes?: string;
  emotions?: string[];
  savedAt: string;
};

export function saveTradeDraft(draft: Omit<TradeDraft, "savedAt">) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    DRAFT_KEY,
    JSON.stringify({ ...draft, savedAt: new Date().toISOString() })
  );
}

export function loadTradeDraft(): TradeDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as TradeDraft) : null;
  } catch {
    return null;
  }
}

export function clearTradeDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}
