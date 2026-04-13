"use server";

import { getDb } from "@/db";
import { weddingSettings, hotels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateWeddingDate(date: string) {
  const db = getDb();
  const [existing] = await db.select().from(weddingSettings).limit(1);

  if (existing) {
    await db
      .update(weddingSettings)
      .set({ weddingDate: date, updatedAt: new Date() })
      .where(eq(weddingSettings.id, existing.id));
  } else {
    await db.insert(weddingSettings).values({ weddingDate: date });
  }

  revalidatePath("/", "layout");
}

export async function updateTotalBudget(amount: number) {
  const db = getDb();
  const [existing] = await db.select().from(weddingSettings).limit(1);

  if (existing) {
    await db
      .update(weddingSettings)
      .set({ totalBudget: amount, updatedAt: new Date() })
      .where(eq(weddingSettings.id, existing.id));
  } else {
    await db.insert(weddingSettings).values({ totalBudget: amount });
  }

  revalidatePath("/plan", "layout");
}

export async function updateSettings(data: {
  partner1Name?: string;
  partner2Name?: string;
  weddingDate?: string;
  ceremonyTime?: string;
  receptionTime?: string;
  venueName?: string;
  venueAddress?: string;
  venueCity?: string;
  venueState?: string;
  venueZip?: string;
  venueMapUrl?: string;
  totalBudget?: number;
  rsvpDeadline?: string;
  guestCap?: number;
  dressCode?: string;
  directions?: string;
  parking?: string;
}) {
  const db = getDb();
  const [existing] = await db.select().from(weddingSettings).limit(1);

  const setData = { ...data, updatedAt: new Date() };

  if (existing) {
    await db
      .update(weddingSettings)
      .set(setData)
      .where(eq(weddingSettings.id, existing.id));
  } else {
    await db.insert(weddingSettings).values(setData);
  }

  revalidatePath("/", "layout");
}

export async function addHotel(data: {
  name: string;
  address?: string;
  phone?: string;
  notes?: string;
  bookingUrl?: string;
}) {
  const db = getDb();
  const [result] = await db
    .insert(hotels)
    .values({
      name: data.name,
      address: data.address || "",
      phone: data.phone || "",
      notes: data.notes || "",
      bookingUrl: data.bookingUrl || "",
    })
    .returning();

  revalidatePath("/", "layout");
  return result;
}

export async function updateHotel(
  id: number,
  data: {
    name?: string;
    address?: string;
    phone?: string;
    notes?: string;
    bookingUrl?: string;
  }
) {
  const db = getDb();
  await db.update(hotels).set(data).where(eq(hotels.id, id));
  revalidatePath("/", "layout");
}

export async function removeHotel(id: number) {
  const db = getDb();
  await db.delete(hotels).where(eq(hotels.id, id));
  revalidatePath("/", "layout");
}
