"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Search, X, MapPin, User } from "lucide-react";
import {
  PX_PER_MIN,
  DAY_MINUTES,
  fmtTime,
  isLightColor,
  formatDateHeading,
  computeLayout,
  type ScheduleEvent,
} from "@/lib/schedule";

interface Props {
  events: ScheduleEvent[];
  weddingDate: string;
  initialVendor?: string;
}

export default function PublicScheduleView({
  events,
  weddingDate,
  initialVendor,
}: Props) {
  const [search, setSearch] = useState("");
  const [personFilter, setPersonFilter] = useState<string>(
    initialVendor && initialVendor.trim() ? initialVendor.trim() : "all"
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const people = useMemo(() => {
    const set = new Set<string>();
    for (const ev of events) {
      const p = ev.person.trim();
      if (p) set.add(p);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [events]);

  const filterActive = search.trim() !== "" || personFilter !== "all";

  const matchedIds = useMemo(() => {
    if (!filterActive) return null;
    const q = search.trim().toLowerCase();
    const ids = new Set<number>();
    for (const ev of events) {
      if (personFilter !== "all" && ev.person.trim() !== personFilter) continue;
      if (q) {
        const haystack = `${ev.title} ${ev.person} ${ev.location} ${ev.notes}`.toLowerCase();
        if (!haystack.includes(q)) continue;
      }
      ids.add(ev.id);
    }
    return ids;
  }, [events, search, personFilter, filterActive]);

  const layout = useMemo(() => computeLayout(events), [events]);
  const selectedEvent =
    selectedId !== null ? events.find((e) => e.id === selectedId) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-4 space-y-3">
          <div className="flex flex-wrap items-center gap-4">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Wedding day timeline</p>
              <p className="text-base font-heading">{formatDateHeading(weddingDate)}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, vendor, location, notes…"
                className="pl-8 pr-8"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Select
              value={personFilter}
              onValueChange={(v) => setPersonFilter(v ?? "all")}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All vendors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All vendors</SelectItem>
                {people.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filterActive && (
              <>
                <span className="text-xs text-muted-foreground">
                  {matchedIds?.size ?? 0} of {events.length} match
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setPersonFilter("all");
                  }}
                >
                  Clear
                </Button>
              </>
            )}
          </div>
          {filterActive && matchedIds && matchedIds.size > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {events
                .filter((ev) => matchedIds.has(ev.id))
                .sort((a, b) => a.startMinutes - b.startMinutes)
                .map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => setSelectedId(ev.id)}
                    className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs hover:bg-accent transition-colors"
                  >
                    <span
                      className="h-2 w-2 rounded-sm"
                      style={{ backgroundColor: ev.color }}
                    />
                    <span className="font-medium">
                      {ev.title || "Untitled"}
                    </span>
                    <span className="text-muted-foreground">
                      {fmtTime(ev.startMinutes)}
                    </span>
                  </button>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEvent && (
        <Card>
          <CardContent className="py-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-heading text-lg">
                  {selectedEvent.title || "Untitled"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {fmtTime(selectedEvent.startMinutes)} – {fmtTime(selectedEvent.endMinutes)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {selectedEvent.location && (
              <p className="text-sm flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                {selectedEvent.location}
              </p>
            )}
            {selectedEvent.person && (
              <p className="text-sm flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                {selectedEvent.person}
              </p>
            )}
            {selectedEvent.notes && (
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {selectedEvent.notes}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="flex">
            <div
              className="relative w-16 shrink-0 border-r"
              style={{ height: DAY_MINUTES * PX_PER_MIN }}
            >
              {Array.from({ length: 25 }, (_, h) => (
                <div
                  key={h}
                  className="absolute left-0 right-0 text-[10px] text-muted-foreground -translate-y-1/2 pr-2 text-right"
                  style={{ top: h * 60 * PX_PER_MIN }}
                >
                  {h === 0 || h === 24 ? "12 AM" : fmtTime(h * 60).replace(":00 ", " ")}
                </div>
              ))}
            </div>

            <div
              className="relative flex-1 select-none"
              style={{ height: DAY_MINUTES * PX_PER_MIN }}
            >
              {Array.from({ length: 24 }, (_, h) => (
                <div
                  key={`h-${h}`}
                  className="absolute left-0 right-0 border-t border-border/60"
                  style={{ top: h * 60 * PX_PER_MIN }}
                />
              ))}
              {Array.from({ length: 24 }, (_, h) => (
                <div
                  key={`hh-${h}`}
                  className="absolute left-0 right-0 border-t border-border/25"
                  style={{ top: (h * 60 + 30) * PX_PER_MIN }}
                />
              ))}

              {events.map((ev) => {
                const lo = layout.get(ev.id);
                const lane = lo?.lane ?? 0;
                const cols = lo?.cols ?? 1;
                const top = ev.startMinutes * PX_PER_MIN;
                const height = (ev.endMinutes - ev.startMinutes) * PX_PER_MIN;
                const light = isLightColor(ev.color);
                const textColor = light ? "#1a1a1a" : "#ffffff";
                const widthPct = 100 / cols;
                const leftPct = lane * widthPct;
                const isMatch = matchedIds ? matchedIds.has(ev.id) : true;
                const dimmed = filterActive && !isMatch;
                const highlighted = filterActive && isMatch;
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => setSelectedId(ev.id)}
                    className={`absolute rounded-md overflow-hidden shadow-sm border px-1.5 py-1 text-xs text-left transition-opacity ${
                      highlighted
                        ? "ring-2 ring-offset-1 ring-primary border-black/10"
                        : "border-black/10"
                    }`}
                    style={{
                      top,
                      height: Math.max(height, 14),
                      left: `calc(${leftPct}% + 2px)`,
                      width: `calc(${widthPct}% - 4px)`,
                      backgroundColor: ev.color,
                      color: textColor,
                      opacity: dimmed ? 0.2 : 1,
                    }}
                  >
                    <div className="font-medium leading-tight truncate">
                      {ev.title || "Untitled"}
                    </div>
                    {height >= 28 && (
                      <div className="opacity-80 leading-tight truncate">
                        {fmtTime(ev.startMinutes)} – {fmtTime(ev.endMinutes)}
                      </div>
                    )}
                    {height >= 56 && ev.location && (
                      <div className="opacity-80 leading-tight truncate">
                        {ev.location}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
