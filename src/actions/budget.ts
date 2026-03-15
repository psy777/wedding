"use server";

import { getDb } from "@/db";
import { budgetCategories, budgetItems, budgetAttachments } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

async function deleteUploadedFile(fileUrl: string) {
  try {
    const key = fileUrl.split("/f/")[1];
    if (key) await utapi.deleteFiles(key);
  } catch {}
}

// ── Category Actions ──────────────────────────────────────────────

export async function addBudgetCategory(data: {
  name: string;
  budgetAmount: number;
}) {
  const db = getDb();
  const [result] = await db
    .select({
      maxOrder: sql<number>`coalesce(max(${budgetCategories.sortOrder}), -1)`,
    })
    .from(budgetCategories);
  const nextOrder = (result?.maxOrder ?? -1) + 1;

  const [cat] = await db
    .insert(budgetCategories)
    .values({ ...data, sortOrder: nextOrder })
    .returning();
  revalidatePath("/plan", "layout");
  return cat;
}

export async function updateBudgetCategory(
  id: number,
  data: { name?: string; budgetAmount?: number }
) {
  const db = getDb();
  await db
    .update(budgetCategories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(budgetCategories.id, id));
  revalidatePath("/plan", "layout");
}

export async function removeBudgetCategory(id: number) {
  const db = getDb();

  // Get all items in this category to clean up blob attachments
  const items = await db
    .select({ id: budgetItems.id })
    .from(budgetItems)
    .where(eq(budgetItems.categoryId, id));

  if (items.length > 0) {
    const allAttachments: { fileUrl: string }[] = [];
    for (const item of items) {
      const atts = await db
        .select({ fileUrl: budgetAttachments.fileUrl })
        .from(budgetAttachments)
        .where(eq(budgetAttachments.budgetItemId, item.id));
      allAttachments.push(...atts);
    }

    if (allAttachments.length > 0) {
      await Promise.all(allAttachments.map((a) => deleteUploadedFile(a.fileUrl)));
    }
  }

  // Cascade delete handles items and their attachments
  await db.delete(budgetCategories).where(eq(budgetCategories.id, id));
  revalidatePath("/plan", "layout");
}

// ── Item (Expense) Actions ────────────────────────────────────────

export async function addBudgetItem(data: {
  categoryId: number;
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

  const attachments = await db
    .select()
    .from(budgetAttachments)
    .where(eq(budgetAttachments.budgetItemId, id));

  if (attachments.length > 0) {
    await Promise.all(
      attachments.map((a) => deleteUploadedFile(a.fileUrl))
    );
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

// ── Attachment Actions ────────────────────────────────────────────

export async function deleteAttachment(id: number, fileUrl: string) {
  const db = getDb();
  await deleteUploadedFile(fileUrl);
  await db.delete(budgetAttachments).where(eq(budgetAttachments.id, id));
  revalidatePath("/plan/budget");
}
