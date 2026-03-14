"use server";

import { getDb } from "@/db";
import { seatingTables, seatingGuests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addSeatingTable(data: {
  name: string;
  capacity: number;
}) {
  const db = getDb();
  await db.insert(seatingTables).values(data);
  revalidatePath("/plan", "layout");
}

export async function removeSeatingTable(id: number) {
  const db = getDb();
  await db.delete(seatingTables).where(eq(seatingTables.id, id));
  revalidatePath("/plan", "layout");
}

export async function addGuest(data: {
  name: string;
  tableId: number | null;
}) {
  const db = getDb();
  await db.insert(seatingGuests).values(data);
  revalidatePath("/plan", "layout");
}

export async function removeGuest(id: number) {
  const db = getDb();
  await db.delete(seatingGuests).where(eq(seatingGuests.id, id));
  revalidatePath("/plan", "layout");
}

export async function moveGuest(guestId: number, tableId: number | null) {
  const db = getDb();
  await db
    .update(seatingGuests)
    .set({ tableId })
    .where(eq(seatingGuests.id, guestId));
  revalidatePath("/plan/seating");
}
