import { getDb } from "@/db";
import {
  checklistItems,
  budgetItems,
  weddingSettings,
} from "@/db/schema";
import { count, eq, sql } from "drizzle-orm";
import { getDueDate } from "@/lib/planning-data";
import OverviewSection from "@/components/plan/OverviewSection";

export default async function PlanOverviewPage() {
  const db = getDb();

  const [settings] = await db.select().from(weddingSettings).limit(1);
  const weddingDate = settings?.weddingDate || "2027-01-01";
  const totalBudget = settings?.totalBudget || 0;
  const rsvpDeadline = settings?.rsvpDeadline || "";

  // Checklist stats
  const [totalResult] = await db
    .select({ value: count() })
    .from(checklistItems);
  const [completedResult] = await db
    .select({ value: count() })
    .from(checklistItems)
    .where(eq(checklistItems.completed, true));

  // Budget stats
  const [budgetStats] = await db
    .select({
      totalActual: sql<number>`coalesce(sum(${budgetItems.actual}), 0)`,
    })
    .from(budgetItems);

  // Compute expected progress: items whose due date has passed
  const allItems = await db.select().from(checklistItems);
  const now = new Date();
  const expectedDone = allItems.filter((item) => {
    const dueDate = getDueDate(weddingDate, item.monthsBefore!);
    return dueDate <= now;
  }).length;

  return (
    <OverviewSection
      stats={{
        checklistTotal: totalResult.value,
        checklistCompleted: completedResult.value,
        expectedDone,
        totalBudget,
        totalSpent: budgetStats.totalActual,
      }}
      weddingDate={weddingDate}
      rsvpDeadline={rsvpDeadline}
    />
  );
}
