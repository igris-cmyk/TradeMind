/** Shared Lightweight Charts theme tokens */
export const chartTheme = {
  background: "transparent",
  text: "#71717A",
  grid: "rgba(255,255,255,0.03)",
  crosshair: "rgba(99, 102, 241, 0.35)",
  border: "rgba(255,255,255,0.04)",
  fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
  positive: "#10B981",
  negative: "#F43F5E",
  primary: "#6366F1",
  positiveFill: "rgba(16, 185, 129, 0.25)",
  negativeFill: "rgba(244, 63, 94, 0.25)",
} as const;

export function pnlColor(value: number) {
  return value >= 0 ? chartTheme.positive : chartTheme.negative;
}

export function baseChartOptions(width?: number, height?: number) {
  return {
    layout: {
      background: { type: "solid" as const, color: chartTheme.background },
      textColor: chartTheme.text,
      fontFamily: chartTheme.fontFamily,
    },
    grid: {
      vertLines: { color: chartTheme.grid },
      horzLines: { color: chartTheme.grid },
    },
    crosshair: {
      vertLine: { color: chartTheme.crosshair, width: 1 as const },
      horzLine: { color: chartTheme.crosshair, width: 1 as const },
    },
    rightPriceScale: {
      borderColor: chartTheme.border,
      scaleMargins: { top: 0.1, bottom: 0.1 },
    },
    timeScale: {
      borderColor: chartTheme.border,
      timeVisible: true,
      secondsVisible: false,
    },
    width,
    height,
  };
}
