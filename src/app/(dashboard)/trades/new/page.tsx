import type { Metadata } from "next";
import { TradeEntryForm } from "@/components/trades/trade-entry-form";

export const metadata: Metadata = {
  title: "Log New Trade | TradeMind AI Journal",
};

export default function NewTradePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="type-h1">Log New Trade</h1>
        <p className="type-caption mt-1">
          Power-user shortcuts: ⌘↵ save · ⌥L long · ⌥S short · tag emotions for discipline score
        </p>
      </div>
      <TradeEntryForm />
    </div>
  );
}
