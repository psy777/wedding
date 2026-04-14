import { getRSVPStatus } from "@/lib/rsvp-status";
import Navbar from "@/components/ui/Navbar";
import RSVPClosed from "@/components/rsvp/RSVPClosed";
import RSVPContent from "@/components/rsvp/RSVPContent";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function RSVPPage() {
  const status = await getRSVPStatus();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-linen pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6">
        {status.open ? (
          <Suspense>
            <RSVPContent />
          </Suspense>
        ) : (
          <RSVPClosed reason={status.reason} />
        )}
      </main>
    </>
  );
}
