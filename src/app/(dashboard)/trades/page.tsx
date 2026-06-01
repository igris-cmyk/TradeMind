"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, UploadCloud, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ImportModal } from "@/components/trades/import-modal";
import { TradesTable } from "@/components/trades/trades-table";
import { useTrades } from "@/hooks/use-queries";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { fadeUp, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

export default function TradesPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [pairSearch, setPairSearch] = useState("");
  const debouncedSearch = useDebouncedValue(pairSearch, 300);

  const params: Record<string, string> = { page: String(page), limit: "15" };
  if (statusFilter) params.status = statusFilter;
  if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

  const { data, isLoading } = useTrades(params);
  const statuses = ["", "WIN", "LOSS", "BREAKEVEN", "OPEN"];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton variant="text" className="h-7 w-32" />
        <LoadingSkeleton variant="card" count={8} className="h-12" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-5"
      variants={stagger.container(0.04)}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="type-h2">Trades</h1>
          <p className="type-caption mt-0.5">
            {data?.pagination?.total || 0} total · double-click cells to edit
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ImportModal>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <UploadCloud className="h-3.5 w-3.5" />
              Import
            </Button>
          </ImportModal>
          <Link href="/trades/new">
            <Button size="sm" className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Log Trade
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search pairs (server)..."
            value={pairSearch}
            onChange={(e) => { setPairSearch(e.target.value); setPage(1); }}
            className="h-8 pl-8 text-xs bg-white/[0.02] border-white/[0.06]"
            aria-label="Search trades by pair"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1" />
          {statuses.map((s) => (
            <button
              key={s || "all"}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150",
                statusFilter === s
                  ? s === "WIN"
                    ? "bg-accent-green/10 text-accent-green border border-accent-green/20"
                    : s === "LOSS"
                    ? "bg-accent-red/10 text-accent-red border border-accent-red/20"
                    : "bg-primary/10 text-primary-300 border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03] border border-transparent"
              )}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </motion.div>

      {!data?.trades?.length ? (
        <EmptyState
          icon={Plus}
          title={debouncedSearch ? "No matching trades" : "No trades yet"}
          description={
            debouncedSearch
              ? `No results for "${debouncedSearch}". Try another pair.`
              : "Start logging your trades to track performance and get AI insights."
          }
          actionLabel={debouncedSearch ? undefined : "Log Your First Trade"}
          onAction={debouncedSearch ? undefined : () => { window.location.href = "/trades/new"; }}
        />
      ) : (
        <motion.div variants={fadeUp}>
          <TradesTable trades={data.trades} />
        </motion.div>
      )}

      {data?.pagination && data.pagination.totalPages > 1 && (
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground font-mono tabular-nums">
            {page} / {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.pagination.totalPages}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
