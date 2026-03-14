"use server";

import { getDb } from "@/db";
import { budgetItems, budgetAttachments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addBudgetItem(data: {
  category: string;
  name: string;
  estimated: number;
  actual: number;
}) {
  const db = getDb();
  const [item] = await db.insert(budgetItems).values(data).returning();
  revalidatePath("/plan", "layout");
  return item;
}

export async function updateBudgetItem(
  id: number,
  data: {
    category?: string;
    name?: string;
    estimated?: number;
    actual?: number;
    paid?: boolean;
    notes?: string;
  }
) {
  const db = getDb();
  await db
    .update(budgetItems)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(budgetItems.id, id));
  revalidatePath("/plan", "layout");
}

export async function removeBudgetItem(id: number) {
  const db = getDb();

  // Get attachments to delete blob files
  const attachments = await db
    .select()
    .from(budgetAttachments)
    .where(eq(budgetAttachments.budgetItemId, id));

  if (attachments.length > 0) {
    try {
      const { del } = await import("@vercel/blob");
      await Promise.all(
        attachments.map((a) => del(a.fileUrl).catch(() => {}))
      );
    } catch {}
  }

  await db.delete(budgetItems).where(eq(budgetItems.id, id));
  revalidatePath("/plan", "layout");
}

export async function toggleBudgetItemPaid(id: number, paid: boolean) {
  const db = getDb();
  await db
    .update(budgetItems)
    .set({ paid, updatedAt: new Date() })
    .where(eq(budgetItems.id, id));
  revalidatePath("/plan/budget");
}

export async function deleteAttachment(id: number, fileUrl: string) {
  const db = getDb();
  try {
    const { del } = await import("@vercel/blob");
    await del(fileUrl).catch(() => {});
  } catch {}
  await db.delete(budgetAttachments).where(eq(budgetAttachments.id, id));
  revalidatePath("/plan/budget");
}
