import { NextRequest, NextResponse } from "next/server";
import { writeRSVP, lookupHousehold, getAllHouseholds } from "@/lib/google-sheets";
import { SubmitPayload, SubmitResponse } from "@/lib/types";
import { WEDDING } from "@/config/wedding";
import { getDb } from "@/db";
import { weddingSettings } from "@/db/schema";

function countCurrentlyAttending(households: { headAttending: string; familyAttending: string[]; plusOneAttending: string; childrenCount: number }[]): number {
  let total = 0;
  for (const h of households) {
    if (h.headAttending === "attending") total++;
    for (const s of h.familyAttending) {
      if (s === "attending") total++;
    }
    if (h.plusOneAttending === "attending") total++;
    total += h.childrenCount;
  }
  return total;
}

export async function POST(request: NextRequest): Promise<NextResponse<SubmitResponse>> {
  try {
    const body: SubmitPayload = await request.json();
    const { householdCode, rowIndex, formData } = body;

    // Validate required fields
    if (!householdCode || !rowIndex || !formData) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Validate head attendance selected
    if (!formData.headAttending) {
      return NextResponse.json(
        { success: false, error: "Please indicate whether you will be attending." },
        { status: 400 }
      );
    }

    // Determine if anyone is attending; only require address if so
    const anyoneAttending =
      formData.headAttending === "attending" ||
      Object.values(formData.familyAttending || {}).some((v) => v === "attending") ||
      formData.plusOneAttending === "attending" ||
      (formData.childrenCount || 0) > 0;

    if (anyoneAttending) {
      if (!formData.streetAddress?.trim() || !formData.city?.trim() || !formData.state?.trim() || !formData.zip?.trim()) {
        return NextResponse.json(
          { success: false, error: "Please provide your full mailing address." },
          { status: 400 }
        );
      }
    }

    // Read settings from DB (deadline + guest cap)
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

    // Check RSVP deadline
    const deadline = new Date(deadlineIso);
    if (new Date() > deadline) {
      return NextResponse.json(
        { success: false, error: "The RSVP deadline has passed. Please contact the couple directly." },
        { status: 400 }
      );
    }

    // Check guest cap (only if this submission includes attending guests)
    if (guestCap !== null && formData.headAttending === "attending") {
      const allHouseholds = await getAllHouseholds();
      // Exclude the current household from the count (they may be updating their RSVP)
      const others = allHouseholds.filter((h) => h.householdCode !== householdCode);
      const currentAttending = countCurrentlyAttending(others);

      // Count how many are attending in this submission
      let thisSubmissionAttending = 0;
      if (formData.headAttending === "attending") thisSubmissionAttending++;
      for (const member of Object.values(formData.familyAttending)) {
        if (member === "attending") thisSubmissionAttending++;
      }
      if (formData.plusOneAttending === "attending") thisSubmissionAttending++;
      thisSubmissionAttending += formData.childrenCount || 0;

      if (currentAttending + thisSubmissionAttending > guestCap) {
        return NextResponse.json(
          { success: false, error: "We've reached our guest capacity. Please contact the couple directly." },
          { status: 400 }
        );
      }
    }

    // Re-verify household code matches row
    const household = await lookupHousehold(householdCode);
    if (!household || household.rowIndex !== rowIndex) {
      return NextResponse.json(
        { success: false, error: "Verification failed. Please try looking up your code again." },
        { status: 400 }
      );
    }

    // Build family attending array in order
    const familyAttending = household.familyMembers.map(
      (member) => formData.familyAttending[member] || ""
    );

    await writeRSVP(rowIndex, householdCode, {
      headAttending: formData.headAttending,
      familyAttending,
      plusOneName: formData.plusOneName,
      plusOneAttending: formData.plusOneAttending,
      childrenNames: formData.childrenNames.slice(0, formData.childrenCount),
      childrenCount: formData.childrenCount,
      dietaryNotes: formData.dietaryNotes,
      tosAccepted: formData.tosAccepted,
      streetAddress: formData.streetAddress,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
