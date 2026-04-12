import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!email || !key || !sheetId) {
      return NextResponse.json(
        { success: false, error: "Google Sheets not configured" },
        { status: 500 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: email, private_key: key },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const meta = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
      fields: "sheets.properties.title",
    });
    const sheetName =
      meta.data.sheets?.[0]?.properties?.title || "Sheet1";

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${sheetName}'`,
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          totalHouseholds: 0,
          responded: 0,
          attending: 0,
          declined: 0,
          pendingHouseholds: 0,
        },
      });
    }

    const headers = rows[0].map((h: string) => h.trim().toLowerCase());
    const col = (name: string) => headers.indexOf(name);

    let totalHouseholds = 0;
    let responded = 0;
    let attending = 0;
    let declined = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cell = (name: string) => (row[col(name)] || "").trim();

      totalHouseholds++;

      if (!cell("submitted_at")) continue;
      responded++;

      // Head of household
      const headStatus = cell("head_attending").toLowerCase();
      if (headStatus === "attending") attending++;
      else if (headStatus === "not_attending") declined++;

      // Family members
      const family = cell("family_members")
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
      const familyStatuses = cell("family_attending")
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
      for (const status of familyStatuses) {
        if (status === "attending") attending++;
        else if (status === "not_attending") declined++;
      }
      declined += Math.max(0, family.length - familyStatuses.length);

      // Plus one
      const plusOneStatus = cell("plus_one_attending").toLowerCase();
      if (plusOneStatus === "attending") attending++;
      else if (plusOneStatus === "not_attending") declined++;

      // Children
      const childrenCount = parseInt(cell("children_count")) || 0;
      attending += childrenCount;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalHouseholds,
        responded,
        attending,
        declined,
        pendingHouseholds: totalHouseholds - responded,
      },
    });
  } catch (error) {
    console.error("RSVP stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
