/**
 * React Query hooks for the Phase 2 Behavioral Intelligence APIs.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─── Pattern Detection ───────────────────────────────────────

export function useBehaviorPatterns() {
  return useQuery({
    queryKey: ["behavior-patterns"],
    queryFn: async () => {
      const res = await fetch("/api/behavior/patterns");
      if (!res.ok) throw new Error("Failed to fetch patterns");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

// ─── Trader Memory ───────────────────────────────────────────

export function useTraderMemory() {
  return useQuery({
    queryKey: ["trader-memory"],
    queryFn: async () => {
      const res = await fetch("/api/behavior/memory");
      if (!res.ok) throw new Error("Failed to fetch memory");
      return res.json();
    },
    staleTime: 1000 * 60 * 10, // 10 min
  });
}

// ─── Coaching ────────────────────────────────────────────────

export function useCoachingHistory() {
  return useQuery({
    queryKey: ["coaching-history"],
    queryFn: async () => {
      const res = await fetch("/api/coaching");
      if (!res.ok) throw new Error("Failed to fetch coaching");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useGenerateCoaching() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/coaching", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate coaching");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-history"] });
    },
  });
}
