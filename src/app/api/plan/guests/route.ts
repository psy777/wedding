import { NextRequest, NextResponse } from "next/server";
import { updateHouseholdFields, deleteHouseholdRow, appendToLog, lookupHousehold } from "@/lib/google-sheets";

// PUT - Full household edit
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { rowIndex, householdCode, fields } = body as {
      rowIndex: number;
      householdCode: string;
      fields: Record<string, string>;
    };

    if (!rowIndex || !householdCode || !fields) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    fields.updated_at = now;

    // If a response is recorded but the household has never submitted, stamp
    // submitted_at so the guest moves out of "pending" on the guests page.
    const hasResponse =
      (fields.head_attending && fields.head_attending !== "") ||
      (fields.family_attending && fields.family_attending !== "") ||
      (fields.plus_one_attending && fields.plus_one_attending !== "") ||
      (fields.children_count && fields.children_count !== "0" && fields.children_count !== "");
    if (hasResponse) {
      const existing = await lookupHousehold(householdCode);
      if (!existing?.submittedAt) {
        fields.submitted_at = now;
      }
    }

    await updateHouseholdFields(rowIndex, householdCode, fields);

    // Append to audit log so manual edits are recorded alongside RSVP submissions
    try {
      await appendToLog(householdCode, {
        headAttending: fields.head_attending ?? "",
        familyAttending: (fields.family_attending ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        plusOneName: fields.plus_one_name ?? "",
        plusOneAttending: fields.plus_one_attending ?? "",
        childrenNames: (fields.children_names ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        childrenCount: parseInt(fields.children_count ?? "0", 10) || 0,
        streetAddress: fields.street_address ?? "",
        city: fields.city ?? "",
        state: fields.state ?? "",
        zip: fields.zip ?? "",
        dietaryNotes: fields.dietary_notes ?? "",
      });
    } catch (logErr) {
      console.error("Audit log append failed:", logErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Guest update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update guest" },
      { status: 500 }
    );
  }
}

// PATCH - Quick field toggle (texted, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { rowIndex, householdCode, field, value } = body as {
      rowIndex: number;
      householdCode: string;
      field: string;
      value: string;
    };

    if (!rowIndex || !householdCode || !field) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await updateHouseholdFields(rowIndex, householdCode, { [field]: value });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Guest patch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update field" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a household row
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { rowIndex, householdCode } = body as {
      rowIndex: number;
      householdCode: string;
    };

    if (!rowIndex || !householdCode) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await deleteHouseholdRow(rowIndex, householdCode);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Guest delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete guest" },
      { status: 500 }
    );
  }
}
