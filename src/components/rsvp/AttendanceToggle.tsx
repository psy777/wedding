"use client";

import { cn } from "@/lib/utils";

interface AttendanceToggleProps {
  value: "attending" | "not_attending" | "";
  onChange: (value: "attending" | "not_attending") => void;
  acceptLabel?: string;
  declineLabel?: string;
}

export default function AttendanceToggle({
  value,
  onChange,
  acceptLabel = "Joyfully Accepts",
  declineLabel = "Regretfully Declines",
}: AttendanceToggleProps) {
  const base =
    "flex-1 py-2.5 px-4 text-lg font-medium tracking-wide transition-colors duration-300 border";

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onChange("attending")}
        className={cn(
          base,
          value === "attending"
            ? "bg-sage text-white border-sage"
            : "bg-transparent text-clay border-sand hover:border-sage hover:text-sage"
        )}
      >
        {acceptLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange("not_attending")}
        className={cn(
          base,
          value === "not_attending"
            ? "bg-ink text-linen border-ink"
            : "bg-transparent text-clay border-sand hover:border-ink hover:text-ink"
        )}
      >
        {declineLabel}
      </button>
    </div>
  );
}
