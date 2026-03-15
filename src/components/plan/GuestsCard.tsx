"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Mail } from "lucide-react";

interface RSVPStats {
  totalHouseholds: number;
  responded: number;
  attending: number;
  declined: number;
  pendingHouseholds: number;
}

export default function GuestsCard({
  rsvpDeadline,
}: {
  rsvpDeadline: string;
}) {
  const [stats, setStats] = useState<RSVPStats | null>(null);

  useEffect(() => {
    fetch("/api/plan/rsvp-stats")
      .then((r) => r.json())
      .then((r) => {
        if (r.success) setStats(r.data);
      })
      .catch(() => {});
  }, []);

  const deadlineDate = rsvpDeadline ? new Date(rsvpDeadline + "T00:00:00") : null;
  const now = new Date();
  const daysToDeadline = deadlineDate
    ? Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className="flex flex-col justify-center h-full">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Guests & RSVPs
          </p>
        </div>

        {stats ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-2xl font-semibold text-chart-2">
                  {stats.attending}
                </p>
                <p className="text-xs text-muted-foreground">Attending</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {stats.pendingHouseholds}
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {stats.responded} of {stats.totalHouseholds} responded
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-2xl font-semibold">--</p>
            <p className="text-xs text-muted-foreground">Loading...</p>
          </div>
        )}

        {daysToDeadline !== null && daysToDeadline > 0 && (
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
            {daysToDeadline} days until RSVP deadline
          </p>
        )}
      </CardContent>
    </Card>
  );
}
