"use client";

import { useEffect, useState } from "react";

interface Props {
  completed: number;
  expected: number;
  total: number;
}

export default function TaskProgressRing({
  completed,
  expected,
  total,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const size = 120;
  const strokeWidth = 10;
  const R = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * R;

  const completedPct = total > 0 ? completed / total : 0;
  const expectedPct = total > 0 ? expected / total : 0;
  const displayPct = Math.round(completedPct * 100);

  const expectedOffset = circumference * (1 - (mounted ? expectedPct : 0));
  const completedOffset = circumference * (1 - (mounted ? completedPct : 0));

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted"
          />
          {/* Expected arc (lighter, underneath) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={expectedOffset}
            strokeLinecap="round"
            className="text-primary/25 transition-all duration-1000 ease-out"
          />
          {/* Completed arc (darker, on top) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={completedOffset}
            strokeLinecap="round"
            className="text-primary transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold tabular-nums">
            {displayPct}%
          </span>
          <span className="text-[10px] text-muted-foreground">
            {completed}/{total}
          </span>
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-primary" /> Done
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-primary/25" /> Expected
        </span>
      </div>
    </div>
  );
}
