"use server";

import { getDb } from "@/db";
import { checklistItems } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleChecklistItem(id: number, completed: boolean) {
  const db = getDb();
  await db
    .update(checklistItems)
    .set({ completed, updatedAt: new Date() })
    .where(eq(checklistItems.id, id));
  revalidatePath("/plan", "layout");
}

export async function updateChecklistNotes(id: number, notes: string) {
  const db = getDb();
  await db
    .update(checklistItems)
    .set({ notes, updatedAt: new Date() })
    .where(eq(checklistItems.id, id));
  revalidatePath("/plan/checklist");
}

export async function addCustomChecklistItem(data: {
  title: string;
  category: string;
  monthsBefore: number;
}) {
  const db = getDb();
  const [result] = await db
    .select({
      max: sql<number>`coalesce(max(${checklistItems.sortOrder}), 0)`,
    })
    .from(checklistItems);

  await db.insert(checklistItems).values({
    title: data.title,
    category: data.category,
    monthsBefore: data.monthsBefore,
    isCustom: true,
    sortOrder: (result?.max || 0) + 1,
  });

  revalidatePath("/plan", "layout");
}

export async function removeChecklistItem(id: number) {
  const db = getDb();
  await db.delete(checklistItems).where(eq(checklistItems.id, id));
  revalidatePath("/plan", "layout");
}
