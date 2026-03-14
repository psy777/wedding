"use client";

import { useState, useTransition } from "react";
import { updateWeddingDate } from "@/actions/settings";
import { formatDate } from "@/lib/planning-data";

export default function DateCountdown({
  weddingDate: initialDate,
}: {
  weddingDate: string;
}) {
  const [weddingDate, setWeddingDate] = useState(initialDate);
  const [isPending, startTransition] = useTransition();

  const wedding = new Date(weddingDate + "T00:00:00");
  const now = new Date();
  const diffMs = wedding.getTime() - now.getTime();
  const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const handleDateChange = (date: string) => {
    setWeddingDate(date);
    startTransition(() => {
      updateWeddingDate(date);
    });
  };

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-5 mb-8">
      <div className="flex flex-wrap items-center gap-6">
        <div>
          <label className="block text-xs text-stone-400 mb-1">
            Wedding Date
          </label>
          <input
            type="date"
            value={weddingDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-md text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
            disabled={isPending}
          />
        </div>
        <div className="flex-1 text-right">
          {daysUntil > 0 ? (
            <div>
              <p className="text-3xl sm:text-4xl font-heading text-stone-800">
                {daysUntil}
              </p>
              <p className="text-sm text-stone-500">
                days until {formatDate(wedding)}
              </p>
            </div>
          ) : daysUntil === 0 ? (
            <p className="text-2xl font-heading text-rose-500">
              Today&apos;s the day!
            </p>
          ) : (
            <p className="text-xl font-heading text-stone-500">
              Congratulations! You&apos;re married!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
