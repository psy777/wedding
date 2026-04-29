import { getDb } from "@/db";
import { scheduleEvents, weddingSettings } from "@/db/schema";
import { asc } from "drizzle-orm";
import Navbar from "@/components/ui/Navbar";
import PublicScheduleView from "@/components/PublicScheduleView";

export const dynamic = "force-dynamic";

export default async function PublicSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ vendor?: string }>;
}) {
  const { vendor } = await searchParams;
  const db = getDb();
  const events = await db
    .select()
    .from(scheduleEvents)
    .orderBy(asc(scheduleEvents.startMinutes));
  const settings = await db.select().from(weddingSettings).limit(1);

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-heading text-3xl sm:text-4xl text-foreground mb-1">
            Wedding Day Schedule
          </h1>
          <p className="text-muted-foreground text-sm">
            Filter to your role to see only the events you&apos;re running.
          </p>
        </div>
        <PublicScheduleView
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
          initialVendor={vendor}
        />
      </main>
    </>
  );
}
