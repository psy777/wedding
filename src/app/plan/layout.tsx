import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { sql } from "drizzle-orm";
import Navbar from "@/components/ui/Navbar";
import PlanNav from "@/components/plan/PlanNav";
import PlanLockScreen from "@/components/plan/PlanLockScreen";
import { ensureSeed } from "@/db/seed";
import { getDb } from "@/db";
import { weddingSettings, passkeyCredentials } from "@/db/schema";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default async function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureSeed();

  const db = getDb();
  const [settings] = await db.select().from(weddingSettings).limit(1);
  const passcodeHash = settings?.planPasscode;

  let isAuthenticated = true;

  if (passcodeHash && passcodeHash.length > 0) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("plan_session");
    const expectedToken = createHmac("sha256", passcodeHash)
      .update("plan_session")
      .digest("hex");
    isAuthenticated = sessionCookie?.value === expectedToken;
  }

  if (!isAuthenticated) {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(passkeyCredentials);

    return (
      <>
        <Navbar />
        <main className="pt-20 pb-16 flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <PlanLockScreen hasPasskeys={count > 0} />
        </main>
      </>
    );
  }

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
