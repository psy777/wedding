import Navbar from "@/components/ui/Navbar";
import PlanNav from "@/components/plan/PlanNav";
import { ensureSeed } from "@/db/seed";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default async function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureSeed();

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-heading text-3xl sm:text-4xl text-foreground mb-1">
            Wedding Planner
          </h1>
          <p className="text-muted-foreground text-sm">
            Keep track of everything for the big day.
          </p>
        </div>

        <PlanNav />
        <Separator className="mb-6 -mt-2" />

        {children}
      </main>
    </>
  );
}
