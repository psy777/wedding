"use server";

import { getDb } from "@/db";
import { scheduleEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const DAY_MINUTES = 1440;

function clampRange(start: number, end: number) {
  let s = Math.max(0, Math.min(DAY_MINUTES, Math.round(start)));
  let e = Math.max(0, Math.min(DAY_MINUTES, Math.round(end)));
  if (e <= s) e = Math.min(DAY_MINUTES, s + 5);
  if (s >= DAY_MINUTES) s = DAY_MINUTES - 5;
  return { s, e };
}

export async function createScheduleEvent(input: {
  startMinutes: number;
  endMinutes: number;
  title?: string;
  color?: string;
}) {
  const db = getDb();
  const { s, e } = clampRange(input.startMinutes, input.endMinutes);
  const [row] = await db
    .insert(scheduleEvents)
    .values({
      startMinutes: s,
      endMinutes: e,
      title: input.title ?? "",
      color: input.color ?? "#7a8a6a",
    })
    .returning();
  revalidatePath("/plan/schedule");
  return row;
}

export async function updateScheduleEvent(
  id: number,
  fields: Partial<{
    title: string;
    startMinutes: number;
    endMinutes: number;
    color: string;
    notes: string;
    location: string;
    person: string;
  }>
) {
  const db = getDb();
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (fields.title !== undefined) patch.title = fields.title;
  if (fields.color !== undefined) patch.color = fields.color;
  if (fields.notes !== undefined) patch.notes = fields.notes;
  if (fields.location !== undefined) patch.location = fields.location;
  if (fields.person !== undefined) patch.person = fields.person;

  if (fields.startMinutes !== undefined || fields.endMinutes !== undefined) {
    const [existing] = await db
      .select()
      .from(scheduleEvents)
      .where(eq(scheduleEvents.id, id));
    if (!existing) return null;
    const { s, e } = clampRange(
      fields.startMinutes ?? existing.startMinutes,
      fields.endMinutes ?? existing.endMinutes
    );
    patch.startMinutes = s;
    patch.endMinutes = e;
  }

  await db.update(scheduleEvents).set(patch).where(eq(scheduleEvents.id, id));
  revalidatePath("/plan/schedule");
}

export async function deleteScheduleEvent(id: number) {
  const db = getDb();
  await db.delete(scheduleEvents).where(eq(scheduleEvents.id, id));
  revalidatePath("/plan/schedule");
}
