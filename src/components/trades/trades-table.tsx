"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { useUpdateTrade, useDeleteTrade, useBulkTrades } from "@/hooks/use-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

type TradeRow = {
  id: string;
  pair: string;
  direction: string;
  entry: number;
  pnl: number | null;
  rrAchieved: number | null;
  status: string;
  session?: string | null;
  notes?: string | null;
};

export function TradesTable({ trades }: { trades: TradeRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [editField, setEditField] = useState<"pair" | "pnl" | "status" | "notes" | null>(null);
  const [editValue, setEditValue] = useState("");

  const updateTrade = useUpdateTrade();
  const deleteTrade = useDeleteTrade();
  const bulk = useBulkTrades();

  const toggleAll = () => {
    if (selected.size === trades.length) setSelected(new Set());
    else setSelected(new Set(trades.map((t) => t.id)));
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const startEdit = (id: string, field: typeof editField, value: string) => {
    setEditing(id);
    setEditField(field);
    setEditValue(value);
  };

  const commitEdit = async (trade: TradeRow) => {
    if (!editField || editing !== trade.id) return;
    const payload: Record<string, unknown> = { id: trade.id };
    if (editField === "pair") payload.pair = editValue;
    if (editField === "pnl") payload.pnl = parseFloat(editValue) || 0;
    if (editField === "status") payload.status = editValue;
    if (editField === "notes") payload.notes = editValue;
    await updateTrade.mutateAsync(payload as Parameters<typeof updateTrade.mutateAsync>[0]);
    setEditing(null);
    setEditField(null);
  };

  const bulkDelete = () => {
    bulk.mutate({ ids: Array.from(selected), action: "delete" });
    setSelected(new Set());
  };

  const bulkStatus = (status: string) => {
    bulk.mutate({ ids: Array.from(selected), action: "update_status", status });
    setSelected(new Set());
  };

  return (
    <Card className="glass-card overflow-hidden">
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-primary/15 bg-primary/5"
          >
            <span className="text-xs font-medium text-primary-300">
              {selected.size} selected
            </span>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => bulkStatus("WIN")}>
              Mark Win
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => bulkStatus("LOSS")}>
              Mark Loss
            </Button>
            <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={bulkDelete} loading={bulk.isPending}>
              Delete
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[28px_1fr_70px_90px_90px_70px_70px_70px] gap-2 px-4 py-2.5 border-b border-white/[0.04] text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              <button type="button" onClick={toggleAll} aria-label="Select all trades">
                {selected.size === trades.length && trades.length > 0 ? (
                  <CheckSquare className="h-3.5 w-3.5 text-primary-400" />
                ) : (
                  <Square className="h-3.5 w-3.5" />
                )}
              </button>
              <span>Pair</span>
              <span>Dir</span>
              <span>Entry</span>
              <span>P&L</span>
              <span>Status</span>
              <span>R:R</span>
              <span />
            </div>
            <AnimatePresence mode="popLayout">
              {trades.map((trade) => (
                <motion.div
                  key={trade.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                  transition={spring.gentle}
                  className={cn(
                    "grid grid-cols-[28px_1fr_70px_90px_90px_70px_70px_70px] gap-2 px-4 py-2.5 border-b border-white/[0.02] hover:bg-white/[0.015] items-center group",
                    selected.has(trade.id) && "bg-primary/[0.03]"
                  )}
                >
                  <button type="button" onClick={() => toggle(trade.id)} aria-label={`Select ${trade.pair}`}>
                    {selected.has(trade.id) ? (
                      <CheckSquare className="h-3.5 w-3.5 text-primary-400" />
                    ) : (
                      <Square className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground" />
                    )}
                  </button>
                  <div className="min-w-0">
                    {editing === trade.id && editField === "pair" ? (
                      <Input
                        className="h-7 text-xs"
                        value={editValue}
                        autoFocus
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => commitEdit(trade)}
                        onKeyDown={(e) => e.key === "Enter" && commitEdit(trade)}
                      />
                    ) : (
                      <Link href={`/trades/${trade.id}`} className="block min-w-0">
                        <motion.span
                          layoutId={`trade-pair-${trade.id}`}
                          className="text-left text-sm font-medium truncate block hover:text-primary-300"
                          onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); startEdit(trade.id, "pair", trade.pair); }}
                        >
                          {trade.pair}
                        </motion.span>
                      </Link>
                    )}
                  </div>
                  <span className={cn("text-[11px] font-semibold inline-flex items-center gap-0.5", trade.direction === "LONG" ? "text-accent-green" : "text-accent-red")}>
                    {trade.direction === "LONG" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {trade.direction}
                  </span>
                  <span className="text-[13px] font-mono tabular-nums text-muted-foreground">{trade.entry?.toFixed(4)}</span>
                  <div>
                    {editing === trade.id && editField === "pnl" ? (
                      <Input
                        className="h-7 text-xs font-mono"
                        value={editValue}
                        autoFocus
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => commitEdit(trade)}
                        onKeyDown={(e) => e.key === "Enter" && commitEdit(trade)}
                      />
                    ) : (
                      <button
                        type="button"
                        className={cn(
                          "text-[13px] font-mono font-semibold tabular-nums",
                          (trade.pnl ?? 0) > 0 ? "text-accent-green" : (trade.pnl ?? 0) < 0 ? "text-accent-red" : "text-muted-foreground"
                        )}
                        onDoubleClick={() => startEdit(trade.id, "pnl", String(trade.pnl ?? 0))}
                      >
                        {trade.pnl != null ? `$${trade.pnl.toFixed(2)}` : "—"}
                      </button>
                    )}
                  </div>
                  <div>
                    {editing === trade.id && editField === "status" ? (
                      <select
                        className="h-7 text-[10px] rounded border border-white/[0.08] bg-card px-1"
                        value={editValue}
                        autoFocus
                        onChange={async (e) => {
                          setEditValue(e.target.value);
                          await updateTrade.mutateAsync({ id: trade.id, status: e.target.value as "WIN" | "LOSS" | "BREAKEVEN" | "OPEN" });
                          setEditing(null);
                          setEditField(null);
                        }}
                      >
                        {["WIN", "LOSS", "BREAKEVEN", "OPEN"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <button
                        type="button"
                        className={cn(
                          "text-[10px] font-semibold uppercase",
                          trade.status === "WIN" ? "text-accent-green" :
                          trade.status === "LOSS" ? "text-accent-red" :
                          trade.status === "BREAKEVEN" ? "text-accent-yellow" : "text-primary-300"
                        )}
                        onDoubleClick={() => startEdit(trade.id, "status", trade.status)}
                      >
                        {trade.status}
                      </button>
                    )}
                  </div>
                  <span className="text-[13px] font-mono tabular-nums text-muted-foreground">
                    {trade.rrAchieved != null ? `1:${trade.rrAchieved.toFixed(1)}` : "—"}
                  </span>
                  <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/trades/${trade.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-accent-red"
                      onClick={() => deleteTrade.mutate(trade.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
