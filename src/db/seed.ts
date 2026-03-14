import { getDb } from ".";
import { checklistItems, weddingSettings } from "./schema";
import { CHECKLIST_TEMPLATE } from "@/lib/planning-data";
import { count } from "drizzle-orm";

let seeded = false;

export async function ensureSeed() {
  if (seeded) return;

  const db = getDb();

  const [result] = await db
    .select({ value: count() })
    .from(checklistItems);

  if (result.value === 0) {
    await db.insert(checklistItems).values(
      CHECKLIST_TEMPLATE.map((item, index) => ({
        title: item.title,
        category: item.category,
        monthsBefore: item.monthsBefore,
        isCustom: false,
        completed: false,
        notes: "",
        sortOrder: index,
      }))
    );
  }

  const [settings] = await db.select().from(weddingSettings).limit(1);
  if (!settings) {
    await db.insert(weddingSettings).values({
      weddingDate: "2027-01-01",
      totalBudget: 0,
    });
  }

  seeded = true;
}
