"use server";

import { getDb } from "@/db";
import { weddingSettings } from "@/db/schema";
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

  revalidatePath("/plan", "layout");
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
