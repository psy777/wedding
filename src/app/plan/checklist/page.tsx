import { getDb } from "@/db";
import { checklistItems, weddingSettings } from "@/db/schema";
import { asc } from "drizzle-orm";
import ChecklistSection from "@/components/plan/ChecklistSection";

export default async function ChecklistPage() {
  const db = getDb();

  const [settings] = await db.select().from(weddingSettings).limit(1);
  const items = await db
    .select()
    .from(checklistItems)
    .orderBy(asc(checklistItems.sortOrder));

  return (
    <ChecklistSection
      items={items.map((i) => ({
        id: i.id,
        title: i.title,
        category: i.category,
        monthsBefore: i.monthsBefore!,
        isCustom: i.isCustom ?? false,
        completed: i.completed ?? false,
        notes: i.notes ?? "",
      }))}
      weddingDate={settings?.weddingDate || "2027-01-01"}
    />
  );
}
