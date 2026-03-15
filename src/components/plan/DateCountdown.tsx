"use client";

import { useState, useTransition } from "react";
import { updateWeddingDate } from "@/actions/settings";
import { formatDate } from "@/lib/planning-data";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarHeart } from "lucide-react";

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
    <Card className="mb-8">
      <CardContent className="flex flex-wrap items-center gap-6 py-5">
        <div className="space-y-1.5">
          <Label htmlFor="wedding-date" className="text-muted-foreground">
            Wedding Date
          </Label>
          <Input
            id="wedding-date"
            type="date"
            value={weddingDate}
            onChange={(e) => handleDateChange(e.target.value)}
            disabled={isPending}
            className="w-auto"
          />
        </div>
        <div className="flex-1 text-right">
          {daysUntil > 0 ? (
            <div className="flex items-center justify-end gap-3">
              <div>
                <p className="text-4xl font-heading text-foreground tabular-nums">
                  {daysUntil}
                </p>
                <p className="text-sm text-muted-foreground">
                  days until {formatDate(wedding)}
                </p>
              </div>
              <CalendarHeart className="h-8 w-8 text-primary hidden sm:block" />
            </div>
          ) : daysUntil === 0 ? (
            <p className="text-2xl font-heading text-primary">
              Today&apos;s the day!
            </p>
          ) : (
            <p className="text-xl font-heading text-muted-foreground">
              Congratulations! You&apos;re married!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
