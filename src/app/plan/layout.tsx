import Navbar from "@/components/ui/Navbar";
import PlanNav from "@/components/plan/PlanNav";
import DateCountdown from "@/components/plan/DateCountdown";
import { getDb } from "@/db";
import { weddingSettings } from "@/db/schema";
import { ensureSeed } from "@/db/seed";

export const dynamic = "force-dynamic";

export default async function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const db = getDb();
  await ensureSeed();

  const [settings] = await db.select().from(weddingSettings).limit(1);

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl text-stone-800 mb-1">
            Wedding Planner
          </h1>
          <p className="text-stone-500 text-sm">
            Keep track of everything for the big day.
          </p>
        </div>

        <DateCountdown weddingDate={settings?.weddingDate || "2027-01-01"} />
        <PlanNav />

        {children}
      </main>
    </>
  );
}
