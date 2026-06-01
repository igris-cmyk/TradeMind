import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Analyze a specific trade
export function useAnalyzeTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tradeId: string) => {
      const res = await fetch(`/api/trades/${tradeId}/analyze`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to analyze trade");
      return res.json();
    },
    onSuccess: (_, tradeId) => {
      toast.success("Trade analysis complete");
      queryClient.invalidateQueries({ queryKey: ["trade", tradeId] });
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
    onError: () => {
      toast.error("Failed to analyze trade. Please try again.");
    },
  });
}

// Generate global insights
export function useGenerateInsights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/insights", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to generate insights");
      return res.json();
    },
    onSuccess: () => {
      toast.success("New AI insights generated");
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
    onError: () => {
      toast.error("Failed to generate insights. Please try again.");
    },
  });
}

// Fetch global insights
export function useInsights() {
  return useQuery({
    queryKey: ["insights"],
    queryFn: async () => {
      const res = await fetch("/api/insights");
      if (!res.ok) throw new Error("Failed to fetch insights");
      return res.json();
    },
  });
}
