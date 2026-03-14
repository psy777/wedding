import { getDb } from "@/db";
import { budgetItems, budgetAttachments, weddingSettings } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import BudgetSection from "@/components/plan/BudgetSection";

export default async function BudgetPage() {
  const db = getDb();

  const [settings] = await db.select().from(weddingSettings).limit(1);
  const items = await db
    .select()
    .from(budgetItems)
    .orderBy(asc(budgetItems.createdAt));

  const attachments = await db
    .select()
    .from(budgetAttachments)
    .orderBy(asc(budgetAttachments.createdAt));

  // Group attachments by budget item
  const attachmentsByItem = new Map<number, typeof attachments>();
  for (const att of attachments) {
    const list = attachmentsByItem.get(att.budgetItemId) || [];
    list.push(att);
    attachmentsByItem.set(att.budgetItemId, list);
  }

  return (
    <BudgetSection
      totalBudget={settings?.totalBudget || 0}
      items={items.map((i) => ({
        id: i.id,
        category: i.category,
        name: i.name,
        estimated: i.estimated ?? 0,
        actual: i.actual ?? 0,
        paid: i.paid ?? false,
        notes: i.notes ?? "",
        attachments: (attachmentsByItem.get(i.id) || []).map((a) => ({
          id: a.id,
          fileName: a.fileName,
          fileUrl: a.fileUrl,
          fileSize: a.fileSize,
          contentType: a.contentType,
        })),
      }))}
    />
  );
}
