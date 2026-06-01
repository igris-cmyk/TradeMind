"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CalendarHeatmapProps {
  data: Array<{
    day: string;
    value: number;
  }>;
}

export function CalendarHeatmap({ data }: CalendarHeatmapProps) {
  // Build a grid of the last ~12 weeks
  const weeks = useMemo(() => {
    if (!data?.length) return [];

    const now = new Date();
    const result: Array<Array<{ date: string; value: number | null; dayOfWeek: number }>> = [];
    let currentWeek: Array<{ date: string; value: number | null; dayOfWeek: number }> = [];

    // Map data for quick lookup
    const dataMap = new Map(data.map((d) => [d.day, d.value]));

    // Go back 84 days (12 weeks)
    for (let i = 83; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayOfWeek = d.getDay();

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        result.push(currentWeek);
        currentWeek = [];
      }

      currentWeek.push({
        date: dateStr,
        value: dataMap.get(dateStr) ?? null,
        dayOfWeek,
      });
    }

    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }

    return result;
  }, [data]);

  const getColor = (value: number | null) => {
    if (value === null) return "bg-muted/30";
    if (value > 200) return "bg-accent-green/90";
    if (value > 50) return "bg-accent-green/60";
    if (value > 0) return "bg-accent-green/30";
    if (value === 0) return "bg-muted/50";
    if (value > -50) return "bg-accent-red/30";
    if (value > -200) return "bg-accent-red/60";
    return "bg-accent-red/90";
  };

  if (!data?.length) return null;

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Trading Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1">
            {dayLabels.map((label, i) => (
              <div key={i} className="h-[14px] flex items-center">
                <span className="text-[9px] text-muted-foreground w-6 text-right">{label}</span>
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, di) => {
                const day = week.find((d) => d.dayOfWeek === di);
                if (!day) {
                  return <div key={di} className="h-[14px] w-[14px]" />;
                }
                return (
                  <div
                    key={di}
                    className={cn(
                      "h-[14px] w-[14px] rounded-[3px] transition-colors",
                      getColor(day.value)
                    )}
                    title={`${day.date}: ${day.value !== null ? `$${day.value.toFixed(2)}` : "No trades"}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 justify-end">
          <span className="text-[9px] text-muted-foreground">Loss</span>
          <div className="flex gap-0.5">
            {["bg-accent-red/90", "bg-accent-red/60", "bg-accent-red/30", "bg-muted/30", "bg-accent-green/30", "bg-accent-green/60", "bg-accent-green/90"].map((c, i) => (
              <div key={i} className={cn("h-[10px] w-[10px] rounded-[2px]", c)} />
            ))}
          </div>
          <span className="text-[9px] text-muted-foreground">Profit</span>
        </div>
      </CardContent>
    </Card>
  );
}
