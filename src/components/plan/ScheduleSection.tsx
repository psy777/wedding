"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createScheduleEvent,
  updateScheduleEvent,
  deleteScheduleEvent,
} from "@/actions/schedule";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Calendar as CalendarIcon, Search, X } from "lucide-react";

const PX_PER_MIN = 1;
const DAY_MINUTES = 1440;
const SNAP = 5;
const DEFAULT_DURATION = 30;
const RESIZE_HANDLE_PX = 6;
const CLICK_THRESHOLD_PX = 3;
const DEFAULT_COLOR = "#7a8a6a";

interface ScheduleEvent {
  id: number;
  title: string;
  startMinutes: number;
  endMinutes: number;
  color: string;
  notes: string;
  location: string;
  person: string;
}

interface Props {
  events: ScheduleEvent[];
  weddingDate: string;
}

type DragMode =
  | { kind: "create"; anchor: number; current: number; tempId: number }
  | {
      kind: "move";
      eventId: number;
      offsetMin: number;
      origStart: number;
      origEnd: number;
    }
  | {
      kind: "resize-top";
      eventId: number;
      origEnd: number;
    }
  | {
      kind: "resize-bottom";
      eventId: number;
      origStart: number;
    };

function snap(n: number) {
  return Math.round(n / SNAP) * SNAP;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function fmtTime(min: number) {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${m.toString().padStart(2, "0")} ${period}`;
}

function fmtTimeInput(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function parseTimeInput(value: string): number | null {
  const m = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
  return h * 60 + mm;
}

function isLightColor(hex: string) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}

function formatDateHeading(iso: string): string {
  if (!iso) return "Wedding Day";
  const [y, m, d] = iso.split("-").map((s) => parseInt(s, 10));
  if (!y || !m || !d) return "Wedding Day";
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface Layout {
  lane: number;
  cols: number;
}

function computeLayout(events: ScheduleEvent[]): Map<number, Layout> {
  const sorted = [...events].sort(
    (a, b) =>
      a.startMinutes - b.startMinutes || b.endMinutes - a.endMinutes
  );
  const out = new Map<number, Layout>();
  let cluster: { id: number; lane: number }[] = [];
  let active: { id: number; end: number; lane: number }[] = [];

  function closeCluster() {
    if (cluster.length === 0) return;
    const cols = cluster.reduce((max, c) => Math.max(max, c.lane + 1), 1);
    for (const c of cluster) out.set(c.id, { lane: c.lane, cols });
    cluster = [];
  }

  for (const ev of sorted) {
    active = active.filter((a) => a.end > ev.startMinutes);
    if (active.length === 0) closeCluster();
    const usedLanes = new Set(active.map((a) => a.lane));
    let lane = 0;
    while (usedLanes.has(lane)) lane++;
    active.push({ id: ev.id, end: ev.endMinutes, lane });
    cluster.push({ id: ev.id, lane });
  }
  closeCluster();
  return out;
}

export default function ScheduleSection({
  events: initialEvents,
  weddingDate,
}: Props) {
  const router = useRouter();
  const [events, setEvents] = useState<ScheduleEvent[]>(initialEvents);
  const [drag, setDrag] = useState<DragMode | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [personFilter, setPersonFilter] = useState<string>("all");
  const [, startTransition] = useTransition();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const downPosRef = useRef<{ x: number; y: number } | null>(null);
  const movedRef = useRef(false);
  const tempIdRef = useRef(0);

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

  // Re-sync with server data once a drag completes and router.refresh() returns.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!drag) setEvents(initialEvents);
  }, [initialEvents, drag]);

  const renderEvents = useMemo<ScheduleEvent[]>(() => {
    if (drag?.kind === "create") {
      return [
        ...events,
        {
          id: drag.tempId,
          title: "",
          startMinutes: Math.min(drag.anchor, drag.current),
          endMinutes: Math.max(drag.anchor, drag.current),
          color: DEFAULT_COLOR,
          notes: "",
          location: "",
          person: "",
        },
      ];
    }
    return events;
  }, [events, drag]);

  const layout = useMemo(() => computeLayout(renderEvents), [renderEvents]);

  function pxToMinute(clientY: number): number {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const rect = canvas.getBoundingClientRect();
    const y = clientY - rect.top;
    return clamp(snap(y / PX_PER_MIN), 0, DAY_MINUTES);
  }

  function handleCanvasPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-event-id]")) return; // event handles its own
    e.preventDefault();
    const min = pxToMinute(e.clientY);
    tempIdRef.current -= 1;
    setDrag({ kind: "create", anchor: min, current: min, tempId: tempIdRef.current });
    downPosRef.current = { x: e.clientX, y: e.clientY };
    movedRef.current = false;
    canvasRef.current?.setPointerCapture(e.pointerId);
  }

  function handleEventPointerDown(
    e: React.PointerEvent<HTMLDivElement>,
    ev: ScheduleEvent
  ) {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetTop = e.clientY - rect.top;
    const offsetBottom = rect.bottom - e.clientY;
    downPosRef.current = { x: e.clientX, y: e.clientY };
    movedRef.current = false;

    if (offsetTop <= RESIZE_HANDLE_PX) {
      setDrag({
        kind: "resize-top",
        eventId: ev.id,
        origEnd: ev.endMinutes,
      });
    } else if (offsetBottom <= RESIZE_HANDLE_PX) {
      setDrag({
        kind: "resize-bottom",
        eventId: ev.id,
        origStart: ev.startMinutes,
      });
    } else {
      const pointerMin = pxToMinute(e.clientY);
      setDrag({
        kind: "move",
        eventId: ev.id,
        offsetMin: pointerMin - ev.startMinutes,
        origStart: ev.startMinutes,
        origEnd: ev.endMinutes,
      });
    }
    canvasRef.current?.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag) return;
    if (downPosRef.current) {
      const dx = e.clientX - downPosRef.current.x;
      const dy = e.clientY - downPosRef.current.y;
      if (Math.abs(dx) > CLICK_THRESHOLD_PX || Math.abs(dy) > CLICK_THRESHOLD_PX) {
        movedRef.current = true;
      }
    }
    const min = pxToMinute(e.clientY);

    if (drag.kind === "create") {
      setDrag({ ...drag, current: min });
      return;
    }
    if (drag.kind === "move") {
      const duration = drag.origEnd - drag.origStart;
      let newStart = clamp(min - drag.offsetMin, 0, DAY_MINUTES - duration);
      newStart = snap(newStart);
      const newEnd = newStart + duration;
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === drag.eventId
            ? { ...ev, startMinutes: newStart, endMinutes: newEnd }
            : ev
        )
      );
      return;
    }
    if (drag.kind === "resize-top") {
      const newStart = clamp(min, 0, drag.origEnd - SNAP);
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === drag.eventId ? { ...ev, startMinutes: newStart } : ev
        )
      );
      return;
    }
    if (drag.kind === "resize-bottom") {
      const newEnd = clamp(min, drag.origStart + SNAP, DAY_MINUTES);
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === drag.eventId ? { ...ev, endMinutes: newEnd } : ev
        )
      );
      return;
    }
  }

  function handlePointerUp() {
    const d = drag;
    const moved = movedRef.current;
    setDrag(null);
    downPosRef.current = null;
    movedRef.current = false;
    if (!d) return;

    if (d.kind === "create") {
      let start = Math.min(d.anchor, d.current);
      let end = Math.max(d.anchor, d.current);
      if (end - start < SNAP) {
        end = Math.min(DAY_MINUTES, start + DEFAULT_DURATION);
        if (end - start < DEFAULT_DURATION) {
          start = Math.max(0, end - DEFAULT_DURATION);
        }
      }
      startTransition(async () => {
        const row = await createScheduleEvent({
          startMinutes: start,
          endMinutes: end,
        });
        if (row) {
          setEvents((prev) => [
            ...prev,
            {
              id: row.id,
              title: row.title,
              startMinutes: row.startMinutes,
              endMinutes: row.endMinutes,
              color: row.color,
              notes: row.notes ?? "",
              location: row.location ?? "",
              person: row.person ?? "",
            },
          ]);
          setEditingId(row.id);
        }
        router.refresh();
      });
      return;
    }

    if (d.kind === "move" || d.kind === "resize-top" || d.kind === "resize-bottom") {
      const ev = events.find((x) => x.id === d.eventId);
      if (!ev) return;
      if (!moved) {
        // It was a click — open editor
        setEditingId(ev.id);
        return;
      }
      startTransition(async () => {
        await updateScheduleEvent(ev.id, {
          startMinutes: ev.startMinutes,
          endMinutes: ev.endMinutes,
        });
        router.refresh();
      });
    }
  }

  const editingEvent = editingId !== null ? events.find((e) => e.id === editingId) : null;

  function handleSaveEdit(patch: Partial<ScheduleEvent>) {
    if (!editingEvent) return;
    const updated = { ...editingEvent, ...patch };
    setEvents((prev) =>
      prev.map((e) => (e.id === editingEvent.id ? updated : e))
    );
    startTransition(async () => {
      await updateScheduleEvent(editingEvent.id, {
        title: updated.title,
        startMinutes: updated.startMinutes,
        endMinutes: updated.endMinutes,
        color: updated.color,
        notes: updated.notes,
        location: updated.location,
        person: updated.person,
      });
      router.refresh();
    });
    setEditingId(null);
  }

  function handleDelete(id: number) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setEditingId(null);
    startTransition(async () => {
      await deleteScheduleEvent(id);
      router.refresh();
    });
  }

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
            <div className="ml-auto text-xs text-muted-foreground">
              Click and drag to create. Drag edges to resize. Drag body to move.
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
                    onClick={() => setEditingId(ev.id)}
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

      <Card>
        <CardContent className="p-0">
          <div className="flex">
            {/* Time gutter */}
            <div className="relative w-16 shrink-0 border-r" style={{ height: DAY_MINUTES * PX_PER_MIN }}>
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

            {/* Canvas */}
            <div
              ref={canvasRef}
              role="application"
              className="relative flex-1 select-none"
              style={{
                height: DAY_MINUTES * PX_PER_MIN,
                touchAction: "none",
                cursor: drag?.kind === "create" ? "crosshair" : "default",
              }}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {/* Hour grid */}
              {Array.from({ length: 24 }, (_, h) => (
                <div
                  key={`h-${h}`}
                  className="absolute left-0 right-0 border-t border-border/60"
                  style={{ top: h * 60 * PX_PER_MIN }}
                />
              ))}
              {/* Half-hour grid */}
              {Array.from({ length: 24 }, (_, h) => (
                <div
                  key={`hh-${h}`}
                  className="absolute left-0 right-0 border-t border-border/25"
                  style={{ top: (h * 60 + 30) * PX_PER_MIN }}
                />
              ))}

              {/* Events */}
              {renderEvents.map((ev) => {
                const lo = layout.get(ev.id);
                const lane = lo?.lane ?? 0;
                const cols = lo?.cols ?? 1;
                const top = ev.startMinutes * PX_PER_MIN;
                const height = (ev.endMinutes - ev.startMinutes) * PX_PER_MIN;
                const isGhost = ev.id < 0;
                const light = isLightColor(ev.color);
                const textColor = light ? "#1a1a1a" : "#ffffff";
                const widthPct = 100 / cols;
                const leftPct = lane * widthPct;
                const isMatch = matchedIds ? matchedIds.has(ev.id) : true;
                const dimmed = filterActive && !isMatch && !isGhost;
                const highlighted = filterActive && isMatch && !isGhost;
                return (
                  <div
                    key={ev.id}
                    data-event-id={ev.id}
                    className={`absolute rounded-md overflow-hidden shadow-sm border px-1.5 py-1 text-xs transition-opacity ${
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
                      cursor: isGhost ? "crosshair" : "grab",
                      opacity: isGhost ? 0.7 : dimmed ? 0.2 : 1,
                    }}
                    onPointerDown={(e) =>
                      !isGhost && handleEventPointerDown(e, ev)
                    }
                  >
                    {/* Top resize handle */}
                    {!isGhost && (
                      <div
                        className="absolute top-0 left-0 right-0"
                        style={{ height: RESIZE_HANDLE_PX, cursor: "ns-resize" }}
                      />
                    )}
                    <div className="font-medium leading-tight truncate">
                      {ev.title || (isGhost ? "New event" : "Untitled")}
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
                    {/* Bottom resize handle */}
                    {!isGhost && (
                      <div
                        className="absolute bottom-0 left-0 right-0"
                        style={{ height: RESIZE_HANDLE_PX, cursor: "ns-resize" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {editingEvent && (
        <EditDialog
          key={editingEvent.id}
          event={editingEvent}
          onClose={() => setEditingId(null)}
          onSave={handleSaveEdit}
          onDelete={() => handleDelete(editingEvent.id)}
        />
      )}
    </div>
  );
}

function EditDialog({
  event,
  onClose,
  onSave,
  onDelete,
}: {
  event: ScheduleEvent;
  onClose: () => void;
  onSave: (patch: Partial<ScheduleEvent>) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(event.title);
  const [color, setColor] = useState(event.color);
  const [location, setLocation] = useState(event.location);
  const [person, setPerson] = useState(event.person);
  const [notes, setNotes] = useState(event.notes);
  const [startStr, setStartStr] = useState(fmtTimeInput(event.startMinutes));
  const [endStr, setEndStr] = useState(fmtTimeInput(event.endMinutes));

  function handleSave() {
    const startMin = parseTimeInput(startStr) ?? event.startMinutes;
    let endMin = parseTimeInput(endStr) ?? event.endMinutes;
    if (endMin <= startMin) endMin = Math.min(DAY_MINUTES, startMin + SNAP);
    onSave({
      title,
      color,
      location,
      person,
      notes,
      startMinutes: startMin,
      endMinutes: endMin,
    });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit event</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="ev-title">Title</Label>
            <Input
              id="ev-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ceremony"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ev-start">Start</Label>
              <Input
                id="ev-start"
                type="time"
                value={startStr}
                onChange={(e) => setStartStr(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-end">End</Label>
              <Input
                id="ev-end"
                type="time"
                value={endStr}
                onChange={(e) => setEndStr(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ev-location">Location</Label>
              <Input
                id="ev-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Venue / room"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-person">Person</Label>
              <Input
                id="ev-person"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                placeholder="Who's running it"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ev-notes">Notes</Label>
            <Textarea
              id="ev-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ev-color">Color</Label>
            <div className="flex items-center gap-2">
              <input
                id="ev-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-8 w-12 rounded border border-input cursor-pointer bg-transparent"
              />
              <span className="text-xs text-muted-foreground">{color}</span>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
