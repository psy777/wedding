import { getDb } from ".";
import {
  checklistItems,
  weddingSettings,
  hotels,
  budgetCategories,
  budgetItems,
} from "./schema";
import {
  CHECKLIST_TEMPLATE,
  DEFAULT_BUDGET_SECTIONS,
} from "@/lib/planning-data";
import { count } from "drizzle-orm";

let seeded = false;

export async function ensureSeed() {
  if (seeded) return;

  const db = getDb();

  const [result] = await db
    .select({ value: count() })
    .from(checklistItems);

  if (result.value === 0) {
    await db.insert(checklistItems).values(
      CHECKLIST_TEMPLATE.map((item, index) => ({
        title: item.title,
        category: item.category,
        monthsBefore: item.monthsBefore,
        isCustom: false,
        completed: false,
        notes: "",
        sortOrder: index,
      }))
    );
  }

  const [settings] = await db.select().from(weddingSettings).limit(1);
  if (!settings) {
    await db.insert(weddingSettings).values({
      weddingDate: process.env.NEXT_PUBLIC_DATE_ISO || "2027-01-01",
      totalBudget: 0,
      partner1Name: process.env.NEXT_PUBLIC_PARTNER1 || "",
      partner2Name: process.env.NEXT_PUBLIC_PARTNER2 || "",
      venueName: process.env.NEXT_PUBLIC_VENUE_NAME || "",
      venueAddress: process.env.NEXT_PUBLIC_VENUE_ADDRESS || "",
      venueCity: process.env.NEXT_PUBLIC_VENUE_CITY || "",
      venueState: process.env.NEXT_PUBLIC_VENUE_STATE || "",
      venueZip: process.env.NEXT_PUBLIC_VENUE_ZIP || "",
      venueMapUrl: process.env.NEXT_PUBLIC_VENUE_MAP_URL || "",
      ceremonyTime: process.env.NEXT_PUBLIC_TIME_CEREMONY || "",
      receptionTime: process.env.NEXT_PUBLIC_TIME_RECEPTION || "",
      rsvpDeadline: (process.env.NEXT_PUBLIC_RSVP_DEADLINE_ISO || "").replace(/T.*$/, ""),
      dressCode: process.env.NEXT_PUBLIC_DRESS_CODE || "",
      directions: process.env.NEXT_PUBLIC_DIRECTIONS || "",
      parking: process.env.NEXT_PUBLIC_PARKING_INFO || "",
    });
  }

  // Seed hotels from env vars if table is empty
  const [hotelCount] = await db.select({ value: count() }).from(hotels);
  if (hotelCount.value === 0) {
    const envHotels = [1, 2]
      .map((n) => ({
        name: process.env[`NEXT_PUBLIC_HOTEL${n}_NAME`] || "",
        address: process.env[`NEXT_PUBLIC_HOTEL${n}_ADDRESS`] || "",
        phone: process.env[`NEXT_PUBLIC_HOTEL${n}_PHONE`] || "",
        notes: process.env[`NEXT_PUBLIC_HOTEL${n}_NOTES`] || "",
        bookingUrl: process.env[`NEXT_PUBLIC_HOTEL${n}_BOOKING_URL`] || "",
        sortOrder: n - 1,
      }))
      .filter((h) => h.name);

    if (envHotels.length > 0) {
      await db.insert(hotels).values(envHotels);
    }
  }

  // Seed budget categories and default expense items
  const [budgetCatCount] = await db
    .select({ value: count() })
    .from(budgetCategories);

  if (budgetCatCount.value === 0) {
    for (let idx = 0; idx < DEFAULT_BUDGET_SECTIONS.length; idx++) {
      const section = DEFAULT_BUDGET_SECTIONS[idx];
      const [cat] = await db
        .insert(budgetCategories)
        .values({
          name: section.name,
          budgetAmount: 0,
          sortOrder: idx,
        })
        .returning();

      if (section.items.length > 0) {
        await db.insert(budgetItems).values(
          section.items.map((itemName) => ({
            categoryId: cat.id,
            name: itemName,
            estimated: 0,
            actual: 0,
          }))
        );
      }
    }
  }

  seeded = true;
}
