import { getDb } from "@/db";
import { weddingSettings } from "@/db/schema";
import { getAllHouseholds } from "@/lib/google-sheets";
import { WEDDING } from "@/config/wedding";

export type RSVPStatus =
  | { open: true }
  | { open: false; reason: "deadline" | "capacity" };

export async function getRSVPStatus(): Promise<RSVPStatus> {
  let deadlineIso = WEDDING.rsvpDeadline.iso;
  let guestCap: number | null = null;

  try {
    const db = getDb();
    const [settings] = await db.select().from(weddingSettings).limit(1);
    if (settings?.rsvpDeadline) {
      deadlineIso = settings.rsvpDeadline + "T23:59:59Z";
    }
    if (settings?.guestCap && settings.guestCap > 0) {
      guestCap = settings.guestCap;
    }
  } catch {}

  // Check deadline
  if (new Date() > new Date(deadlineIso)) {
    return { open: false, reason: "deadline" };
  }

  // Check guest cap
  if (guestCap !== null) {
    const households = await getAllHouseholds();
    let attending = 0;
    for (const h of households) {
      if (h.headAttending === "attending") attending++;
      for (const s of h.familyAttending) {
        if (s === "attending") attending++;
      }
      if (h.plusOneAttending === "attending") attending++;
      attending += h.childrenCount;
    }
    if (attending >= guestCap) {
      return { open: false, reason: "capacity" };
    }
  }

  return { open: true };
}
