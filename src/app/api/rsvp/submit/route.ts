import { NextRequest, NextResponse } from "next/server";
import { writeRSVP, lookupHousehold } from "@/lib/google-sheets";
import { SubmitPayload, SubmitResponse } from "@/lib/types";
import { WEDDING } from "@/config/wedding";

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

    // Validate TOS accepted
    if (!formData.tosAccepted) {
      return NextResponse.json(
        { success: false, error: "You must accept the terms and conditions." },
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

    // Check RSVP deadline
    const deadline = new Date(WEDDING.rsvpDeadline.iso);
    if (new Date() > deadline) {
      return NextResponse.json(
        { success: false, error: "The RSVP deadline has passed. Please contact the couple directly." },
        { status: 400 }
      );
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
      phone: formData.phone,
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
