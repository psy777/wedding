import { NextRequest, NextResponse } from "next/server";
import { updateHouseholdFields, deleteHouseholdRow } from "@/lib/google-sheets";

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

    // Add updated_at timestamp
    fields.updated_at = new Date().toISOString();

    await updateHouseholdFields(rowIndex, householdCode, fields);

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
