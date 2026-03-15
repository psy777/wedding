"use client";

import { formatDate } from "@/lib/planning-data";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarHeart } from "lucide-react";

export default function CountdownCard({
  weddingDate,
}: {
  weddingDate: string;
}) {
  const wedding = new Date(weddingDate + "T00:00:00");
  const now = new Date();
  const diffMs = wedding.getTime() - now.getTime();
  const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return (
    <Card className="flex flex-col items-center justify-center">
      <CardContent className="py-4 flex flex-col items-center text-center gap-1">
        <CalendarHeart className="h-5 w-5 text-primary" />
        {daysUntil > 0 ? (
          <>
            <p className="text-4xl font-heading text-foreground tabular-nums">
              {daysUntil}
            </p>
            <p className="text-xs text-muted-foreground">
              days until {formatDate(wedding)}
            </p>
          </>
        ) : daysUntil === 0 ? (
          <p className="text-2xl font-heading text-primary">
            Today&apos;s the day!
          </p>
        ) : (
          <p className="text-lg font-heading text-muted-foreground">
            Congratulations!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
