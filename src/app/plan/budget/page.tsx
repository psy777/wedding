import { getDb } from "@/db";
import {
  budgetCategories,
  budgetItems,
  budgetAttachments,
  weddingSettings,
} from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import BudgetSection from "@/components/plan/BudgetSection";

export default async function BudgetPage() {
  const db = getDb();

  const [settings] = await db.select().from(weddingSettings).limit(1);

  const categories = await db
    .select()
    .from(budgetCategories)
    .orderBy(asc(budgetCategories.sortOrder));

  const items = await db
    .select()
    .from(budgetItems)
    .orderBy(asc(budgetItems.createdAt));

  const attachments = await db
    .select()
    .from(budgetAttachments)
    .orderBy(asc(budgetAttachments.createdAt));

  // Group attachments by budget item
  const attachmentsByItem = new Map<
    number,
    {
      id: number;
      fileName: string;
      fileUrl: string;
      fileSize: number | null;
      contentType: string | null;
    }[]
  >();
  for (const att of attachments) {
    const list = attachmentsByItem.get(att.budgetItemId) || [];
    list.push({
      id: att.id,
      fileName: att.fileName,
      fileUrl: att.fileUrl,
      fileSize: att.fileSize,
      contentType: att.contentType,
    });
    attachmentsByItem.set(att.budgetItemId, list);
  }

  // Group items by category
  const itemsByCategory = new Map<
    number,
    {
      id: number;
      categoryId: number;
      name: string;
      estimated: number;
      actual: number;
      paid: boolean;
      notes: string;
      attachments: {
        id: number;
        fileName: string;
        fileUrl: string;
        fileSize: number | null;
        contentType: string | null;
      }[];
    }[]
  >();
  for (const item of items) {
    const list = itemsByCategory.get(item.categoryId) || [];
    list.push({
      id: item.id,
      categoryId: item.categoryId,
      name: item.name,
      estimated: item.estimated ?? 0,
      actual: item.actual ?? 0,
      paid: item.paid ?? false,
      notes: item.notes ?? "",
      attachments: attachmentsByItem.get(item.id) || [],
    });
    itemsByCategory.set(item.categoryId, list);
  }

  return (
    <BudgetSection
      totalBudget={settings?.totalBudget || 0}
      categories={categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        budgetAmount: cat.budgetAmount ?? 0,
        sortOrder: cat.sortOrder ?? 0,
        items: itemsByCategory.get(cat.id) || [],
      }))}
    />
  );
}
