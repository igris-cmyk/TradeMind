"use client";

import { useQueryClient } from "@tanstack/react-query";

/** Prefetch dashboard-critical data on nav hover for instant feel */
export function usePrefetchRoutes() {
  const queryClient = useQueryClient();

  const prefetchDashboard = () => {
    void queryClient.prefetchQuery({
      queryKey: ["trade-stats"],
      queryFn: () => fetch("/api/trades/stats").then((r) => r.json()),
      staleTime: 60 * 1000,
    });
    void queryClient.prefetchQuery({
      queryKey: ["trade-analytics", 30],
      queryFn: () => fetch("/api/trades/analytics?days=30").then((r) => r.json()),
      staleTime: 5 * 60 * 1000,
    });
    void queryClient.prefetchQuery({
      queryKey: ["discipline"],
      queryFn: () => fetch("/api/discipline").then((r) => r.json()),
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchTrades = () => {
    void queryClient.prefetchQuery({
      queryKey: ["trades", { page: "1", limit: "15" }],
      queryFn: () =>
        fetch("/api/trades?page=1&limit=15").then((r) => r.json()),
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchAnalytics = () => {
    void queryClient.prefetchQuery({
      queryKey: ["trade-analytics", 30],
      queryFn: () => fetch("/api/trades/analytics?days=30").then((r) => r.json()),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchPsychology = () => {
    void queryClient.prefetchQuery({
      queryKey: ["discipline"],
      queryFn: () => fetch("/api/discipline").then((r) => r.json()),
      staleTime: 2 * 60 * 1000,
    });
    void queryClient.prefetchQuery({
      queryKey: ["insights"],
      queryFn: () => fetch("/api/insights").then((r) => r.json()),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchByHref = (href: string) => {
    switch (href) {
      case "/dashboard":
        prefetchDashboard();
        break;
      case "/trades":
        prefetchTrades();
        break;
      case "/analytics":
        prefetchAnalytics();
        break;
      case "/psychology":
        prefetchPsychology();
        break;
      default:
        break;
    }
  };

  return { prefetchByHref, prefetchDashboard };
}
