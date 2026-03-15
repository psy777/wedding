"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import TaskProgressRing from "./TaskProgressRing";
import CountdownCard from "./CountdownCard";
import GuestsCard from "./GuestsCard";

interface Props {
  stats: {
    checklistTotal: number;
    checklistCompleted: number;
    expectedDone: number;
    totalBudget: number;
    totalSpent: number;
  };
  weddingDate: string;
  rsvpDeadline: string;
}

export default function OverviewSection({
  stats,
  weddingDate,
  rsvpDeadline,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    });

  // Budget ring calculations
  const ringSize = 120;
  const ringStroke = 10;
  const ringR = (ringSize - ringStroke) / 2;
  const ringCirc = 2 * Math.PI * ringR;
  const spentPct =
    stats.totalBudget > 0
      ? Math.min(1, stats.totalSpent / stats.totalBudget)
      : 0;
  const budgetOffset = ringCirc * (1 - (mounted ? spentPct : 0));
  const spentDisplay = Math.round(spentPct * 100);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Countdown */}
      <CountdownCard weddingDate={weddingDate} />

      {/* Checklist Progress */}
      <Card className="flex items-center justify-center">
        <CardContent className="py-4">
          <TaskProgressRing
            completed={stats.checklistCompleted}
            expected={stats.expectedDone}
            total={stats.checklistTotal}
          />
        </CardContent>
      </Card>

      {/* Budget Ring */}
      <Card className="flex items-center justify-center">
        <CardContent className="py-4">
          <div className="flex flex-col items-center gap-2">
            <div
              className="relative"
              style={{ width: ringSize, height: ringSize }}
            >
              <svg
                width={ringSize}
                height={ringSize}
                className="transform -rotate-90"
              >
                {/* Track */}
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringR}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={ringStroke}
                  className="text-muted"
                />
                {/* Spent arc */}
                {stats.totalBudget > 0 && (
                  <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={ringR}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={ringStroke}
                    strokeDasharray={ringCirc}
                    strokeDashoffset={budgetOffset}
                    strokeLinecap="round"
                    className="text-chart-2 transition-all duration-1000 ease-out"
                  />
                )}
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {stats.totalBudget > 0 ? (
                  <>
                    <span className="text-xl font-semibold tabular-nums">
                      {spentDisplay}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {fmt(stats.totalSpent)}
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] text-muted-foreground text-center px-2">
                    Set budget
                    <br />
                    in Settings
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Budget</p>
          </div>
        </CardContent>
      </Card>

      {/* Guests & RSVPs */}
      <GuestsCard rsvpDeadline={rsvpDeadline} />
    </div>
  );
}
