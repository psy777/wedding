import { getDb } from "@/db";
import {
  checklistItems,
  budgetItems,
  seatingTables,
  seatingGuests,
  weddingSettings,
} from "@/db/schema";
import { count, eq, sql } from "drizzle-orm";
import { getDueDate, formatDate } from "@/lib/planning-data";
import OverviewSection from "@/components/plan/OverviewSection";

export default async function PlanOverviewPage() {
  const db = getDb();

  const [settings] = await db.select().from(weddingSettings).limit(1);
  const weddingDate = settings?.weddingDate || "2027-01-01";
  const totalBudget = settings?.totalBudget || 0;

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
      totalEstimated: sql<number>`coalesce(sum(${budgetItems.estimated}), 0)`,
      totalActual: sql<number>`coalesce(sum(${budgetItems.actual}), 0)`,
    })
    .from(budgetItems);

  // Seating stats
  const [tableResult] = await db
    .select({ value: count() })
    .from(seatingTables);
  const [guestResult] = await db
    .select({ value: count() })
    .from(seatingGuests);
  const [capacityResult] = await db
    .select({
      value: sql<number>`coalesce(sum(${seatingTables.capacity}), 0)`,
    })
    .from(seatingTables);

  // Upcoming deadlines
  const incompleteItems = await db
    .select()
    .from(checklistItems)
    .where(eq(checklistItems.completed, false));

  const upcoming = incompleteItems
    .map((item) => ({
      id: item.id,
      title: item.title,
      dueDate: getDueDate(weddingDate, item.monthsBefore!),
    }))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 8);

  return (
    <OverviewSection
      stats={{
        checklistTotal: totalResult.value,
        checklistCompleted: completedResult.value,
        totalBudget,
        totalEstimated: budgetStats.totalEstimated,
        totalSpent: budgetStats.totalActual,
        tableCount: tableResult.value,
        guestCount: guestResult.value,
        totalCapacity: capacityResult.value,
      }}
      upcoming={upcoming.map((u) => ({
        id: u.id,
        title: u.title,
        dueDateISO: u.dueDate.toISOString(),
      }))}
    />
  );
}
