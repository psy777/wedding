import { getDb } from "@/db";
import { scheduleEvents, weddingSettings } from "@/db/schema";
import { asc } from "drizzle-orm";
import ScheduleSection from "@/components/plan/ScheduleSection";

export default async function SchedulePage() {
  const db = getDb();
  const events = await db
    .select()
    .from(scheduleEvents)
    .orderBy(asc(scheduleEvents.startMinutes));
  const settings = await db.select().from(weddingSettings).limit(1);

  return (
    <ScheduleSection
      events={events.map((e) => ({
        id: e.id,
        title: e.title,
        startMinutes: e.startMinutes,
        endMinutes: e.endMinutes,
        color: e.color,
        notes: e.notes ?? "",
        location: e.location ?? "",
        person: e.person ?? "",
      }))}
      weddingDate={settings[0]?.weddingDate ?? ""}
    />
  );
}
