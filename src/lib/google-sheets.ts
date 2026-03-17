import { google, sheets_v4 } from "googleapis";
import { HouseholdData } from "./types";

let sheetsClient: sheets_v4.Sheets | null = null;

function getSheetClient(): sheets_v4.Sheets {
  if (sheetsClient) return sheetsClient;

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

const SHEET_ID = () => process.env.GOOGLE_SHEET_ID!;

let cachedSheetName: string | null = null;

async function getSheetName(): Promise<string> {
  if (cachedSheetName) return cachedSheetName;

  const sheets = getSheetClient();
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID(),
    fields: "sheets.properties.title",
  });

  cachedSheetName = meta.data.sheets?.[0]?.properties?.title || "Sheet1";
  return cachedSheetName;
}

interface ColumnMap {
  [key: string]: number;
}

function buildColumnMap(headerRow: string[]): ColumnMap {
  const map: ColumnMap = {};
  headerRow.forEach((header, index) => {
    map[header.trim().toLowerCase()] = index;
  });
  return map;
}

function getCellValue(row: string[], colMap: ColumnMap, key: string): string {
  const idx = colMap[key];
  if (idx === undefined) return "";
  return (row[idx] || "").trim();
}

function parseCommaSeparated(value: string): string[] {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

export async function lookupHousehold(code: string): Promise<HouseholdData | null> {
  const sheets = getSheetClient();
  const sheetName = await getSheetName();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID(),
    range: `'${sheetName}'`,
  });

  const rows = response.data.values;
  if (!rows || rows.length < 2) return null;

  const headerRow = rows[0].map((h: string) => h.trim().toLowerCase());
  const colMap = buildColumnMap(headerRow);

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowCode = getCellValue(row, colMap, "household_code");
    if (rowCode.toLowerCase() === code.toLowerCase()) {
      const familyMembersRaw = getCellValue(row, colMap, "family_members");
      const familyMembers = parseCommaSeparated(familyMembersRaw);

      const familyAttendingRaw = getCellValue(row, colMap, "family_attending");
      const familyAttending = familyMembers.length > 0
        ? parseCommaSeparated(familyAttendingRaw)
        : [];

      return {
        rowIndex: i + 1, // 1-indexed for Sheets API
        householdCode: rowCode,
        headOfHousehold: getCellValue(row, colMap, "head_of_household"),
        familyMembers,
        plusOneAllowed: getCellValue(row, colMap, "plus_one_allowed").toLowerCase() === "yes",
        maxChildren: (() => {
          const raw = getCellValue(row, colMap, "max_children").trim();
          return raw === "" ? null : parseInt(raw, 10);
        })(),
        phone: getCellValue(row, colMap, "phone"),
        streetAddress: getCellValue(row, colMap, "street_address"),
        city: getCellValue(row, colMap, "city"),
        state: getCellValue(row, colMap, "state"),
        zip: getCellValue(row, colMap, "zip"),
        headAttending: getCellValue(row, colMap, "head_attending") as HouseholdData["headAttending"],
        familyAttending,
        plusOneName: getCellValue(row, colMap, "plus_one_name"),
        plusOneAttending: getCellValue(row, colMap, "plus_one_attending") as HouseholdData["plusOneAttending"],
        childrenNames: parseCommaSeparated(getCellValue(row, colMap, "children_names")),
        childrenCount: parseInt(getCellValue(row, colMap, "children_count") || "0", 10),
        dietaryNotes: getCellValue(row, colMap, "dietary_notes"),
        tosAccepted: getCellValue(row, colMap, "tos_accepted").toLowerCase() === "yes",
        submittedAt: getCellValue(row, colMap, "submitted_at"),
        updatedAt: getCellValue(row, colMap, "updated_at"),
      };
    }
  }

  return null;
}

export async function writeRSVP(
  rowIndex: number,
  householdCode: string,
  data: {
    headAttending: string;
    familyAttending: string[];
    plusOneName: string;
    plusOneAttending: string;
    childrenNames: string[];
    childrenCount: number;
    dietaryNotes: string;
    tosAccepted: boolean;
    phone: string;
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
  }
): Promise<void> {
  const sheets = getSheetClient();
  const sheetName = await getSheetName();

  // Re-read headers to get current column mapping
  const headerResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID(),
    range: `'${sheetName}'!1:1`,
  });

  const headerRow = (headerResponse.data.values?.[0] || []).map((h: string) =>
    h.trim().toLowerCase()
  );
  const colMap = buildColumnMap(headerRow);

  // Verify the household code matches this row
  const rowResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID(),
    range: `'${sheetName}'!A${rowIndex}`,
  });

  const currentCode = rowResponse.data.values?.[0]?.[0]?.trim();
  if (currentCode?.toLowerCase() !== householdCode.toLowerCase()) {
    throw new Error("Household code does not match row. Possible tampering.");
  }

  // Check if this is an update (already submitted) or first submission
  const submittedAtResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID(),
    range: `'${sheetName}'!T${rowIndex}`,
  });
  const existingSubmittedAt = submittedAtResponse.data.values?.[0]?.[0]?.trim();

  const now = new Date().toISOString();

  // Build update data - we need to write specific cells
  const updates: { range: string; values: string[][] }[] = [];

  function colLetter(colIndex: number): string {
    let letter = "";
    let idx = colIndex;
    while (idx >= 0) {
      letter = String.fromCharCode((idx % 26) + 65) + letter;
      idx = Math.floor(idx / 26) - 1;
    }
    return letter;
  }

  function addUpdate(key: string, value: string) {
    const idx = colMap[key];
    if (idx === undefined) return;
    const col = colLetter(idx);
    updates.push({
      range: `'${sheetName}'!${col}${rowIndex}`,
      values: [[value]],
    });
  }

  // Write address/email fields
  addUpdate("phone", data.phone);
  addUpdate("street_address", data.streetAddress);
  addUpdate("city", data.city);
  addUpdate("state", data.state);
  addUpdate("zip", data.zip);

  // Write RSVP response fields
  addUpdate("head_attending", data.headAttending);
  addUpdate("family_attending", data.familyAttending.join(", "));
  addUpdate("plus_one_name", data.plusOneName);
  addUpdate("plus_one_attending", data.plusOneAttending);
  addUpdate("children_names", data.childrenNames.join(", "));
  addUpdate("children_count", data.childrenCount.toString());
  addUpdate("dietary_notes", data.dietaryNotes);
  addUpdate("tos_accepted", data.tosAccepted ? "yes" : "");
  addUpdate("tos_accepted_at", data.tosAccepted ? now : "");
  addUpdate("submitted_at", existingSubmittedAt || now);
  addUpdate("updated_at", now);

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID(),
    requestBody: {
      valueInputOption: "RAW",
      data: updates,
    },
  });
}
