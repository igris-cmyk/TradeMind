"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateTradeInput, UpdateTradeInput } from "@/validators/trade";

// ─── Trades ──────────────────────────────────────────────────

export function useTrades(params?: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  return useQuery({
    queryKey: ["trades", params],
    queryFn: async () => {
      const res = await fetch(`/api/trades?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch trades");
      return res.json();
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useDiscipline() {
  return useQuery({
    queryKey: ["discipline"],
    queryFn: async () => {
      const res = await fetch("/api/discipline");
      if (!res.ok) throw new Error("Failed to fetch discipline");
      return res.json();
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useTrade(id: string) {
  return useQuery({
    queryKey: ["trade", id],
    queryFn: async () => {
      const res = await fetch(`/api/trades/${id}`);
      if (!res.ok) throw new Error("Failed to fetch trade");
      return res.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 min — individual trade data is stable
  });
}

export function useTradeStats() {
  return useQuery({
    queryKey: ["trade-stats"],
    queryFn: async () => {
      const res = await fetch("/api/trades/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    staleTime: 60 * 1000, // 1 min
  });
}

export function useTradeAnalytics(days = 30, options?: { live?: boolean }) {
  return useQuery({
    queryKey: ["trade-analytics", days],
    queryFn: async () => {
      const res = await fetch(`/api/trades/analytics?days=${days}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    staleTime: options?.live ? 15 * 1000 : 5 * 60 * 1000,
    refetchInterval: options?.live ? 30 * 1000 : false,
  });
}

export function useDisciplineHistory() {
  return useQuery({
    queryKey: ["discipline-history"],
    queryFn: async () => {
      const res = await fetch("/api/discipline/history");
      if (!res.ok) throw new Error("Failed to fetch discipline history");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBulkTrades() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      ids: string[];
      action: "delete" | "update_status";
      status?: string;
    }) => {
      const res = await fetch("/api/trades/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Bulk action failed");
      return res.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["trade-stats"] });
      queryClient.invalidateQueries({ queryKey: ["trade-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["discipline"] });
      toast.success(
        vars.action === "delete"
          ? `${vars.ids.length} trades deleted`
          : `${vars.ids.length} trades updated`
      );
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCreateTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTradeInput) => {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create trade");
      }
      return res.json();
    },
    onMutate: async (newTrade) => {
      await queryClient.cancelQueries({ queryKey: ["trades"] });
      const previous = queryClient.getQueriesData({ queryKey: ["trades"] });

      const optimistic = {
        id: `temp-${Date.now()}`,
        pair: newTrade.pair,
        direction: newTrade.direction,
        entry: newTrade.entry,
        pnl: null,
        status: "OPEN",
        session: newTrade.session ?? null,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueriesData(
        { queryKey: ["trades"] },
        (old: { trades: Array<Record<string, unknown>>; pagination: unknown } | undefined) => {
          if (!old?.trades) return old;
          return { ...old, trades: [optimistic, ...old.trades] };
        }
      );

      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["trade-stats"] });
      queryClient.invalidateQueries({ queryKey: ["trade-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["discipline"] });
      toast.success("Trade logged successfully!");
    },
    onError: (err: Error, _vars, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error(err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
  });
}

export function useUpdateTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateTradeInput) => {
      const res = await fetch(`/api/trades/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update trade");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["trade", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["trade-stats"] });
      queryClient.invalidateQueries({ queryKey: ["trade-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["discipline"] });
      toast.success("Trade updated!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useDeleteTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/trades/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete trade");
      return res.json();
    },
    // ─── Optimistic Delete ─────────────────────────────────────
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["trades"] });

      // Snapshot previous value
      const previousTrades = queryClient.getQueriesData({ queryKey: ["trades"] });

      // Optimistically remove the trade from all cached trade lists
      queryClient.setQueriesData(
        { queryKey: ["trades"] },
        (old: { trades: Array<{ id: string }>; pagination: unknown } | undefined) => {
          if (!old?.trades) return old;
          return {
            ...old,
            trades: old.trades.filter((t) => t.id !== id),
          };
        }
      );

      return { previousTrades };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-stats"] });
      queryClient.invalidateQueries({ queryKey: ["trade-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["discipline"] });
      toast.success("Trade deleted");
    },
    onError: (err: Error, _id, context) => {
      // Rollback on error
      if (context?.previousTrades) {
        context.previousTrades.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
  });
}

// ─── Strategies ──────────────────────────────────────────────

export function useStrategies() {
  return useQuery({
    queryKey: ["strategies"],
    queryFn: async () => {
      const res = await fetch("/api/strategies");
      if (!res.ok) throw new Error("Failed to fetch strategies");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; conceptType?: string }) => {
      const res = await fetch("/api/strategies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create strategy");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategies"] });
      toast.success("Strategy created!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useDeleteStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/strategies/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete strategy");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategies"] });
      toast.success("Strategy deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

// ─── Journal ─────────────────────────────────────────────────

export function useJournalEntries(params?: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  return useQuery({
    queryKey: ["journal", params],
    queryFn: async () => {
      const res = await fetch(`/api/journal?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch journal entries");
      return res.json();
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { mood?: string; content: string; tradeId?: string }) => {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create entry");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal"] });
      toast.success("Journal entry saved!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/journal/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete entry");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal"] });
      toast.success("Journal entry deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
