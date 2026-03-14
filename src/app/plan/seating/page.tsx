import { getDb } from "@/db";
import { seatingTables, seatingGuests } from "@/db/schema";
import { asc, isNull } from "drizzle-orm";
import SeatingSection from "@/components/plan/SeatingSection";

export default async function SeatingPage() {
  const db = getDb();

  const tables = await db
    .select()
    .from(seatingTables)
    .orderBy(asc(seatingTables.createdAt));

  const guests = await db
    .select()
    .from(seatingGuests)
    .orderBy(asc(seatingGuests.createdAt));

  // Build tables with guests
  const guestsByTable = new Map<number, { id: number; name: string }[]>();
  const unassigned: { id: number; name: string }[] = [];

  for (const g of guests) {
    if (g.tableId == null) {
      unassigned.push({ id: g.id, name: g.name });
    } else {
      const list = guestsByTable.get(g.tableId) || [];
      list.push({ id: g.id, name: g.name });
      guestsByTable.set(g.tableId, list);
    }
  }

  return (
    <SeatingSection
      tables={tables.map((t) => ({
        id: t.id,
        name: t.name,
        capacity: t.capacity,
        guests: guestsByTable.get(t.id) || [],
      }))}
      unassignedGuests={unassigned}
    />
  );
}
