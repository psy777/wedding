export const PX_PER_MIN = 1;
export const DAY_MINUTES = 1440;
export const DEFAULT_COLOR = "#7a8a6a";

export interface ScheduleEvent {
  id: number;
  title: string;
  startMinutes: number;
  endMinutes: number;
  color: string;
  notes: string;
  location: string;
  person: string;
}

export function fmtTime(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${m.toString().padStart(2, "0")} ${period}`;
}

export function isLightColor(hex: string): boolean {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}

export function formatDateHeading(iso: string): string {
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

export interface Layout {
  lane: number;
  cols: number;
}

export function computeLayout(events: ScheduleEvent[]): Map<number, Layout> {
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
