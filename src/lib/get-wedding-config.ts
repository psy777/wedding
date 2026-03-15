import { getDb } from "@/db";
import { weddingSettings, hotels } from "@/db/schema";

export interface HotelConfig {
  id: number;
  name: string;
  address: string;
  phone: string;
  notes: string;
  bookingUrl: string;
}

export interface WeddingConfig {
  couple: { partner1: string; partner2: string };
  date: { full: string; short: string; iso: string };
  time: { ceremony: string; reception: string };
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    mapUrl: string;
  };
  dressCode: string;
  rsvpDeadline: { display: string; iso: string };
  travel: {
    hotels: HotelConfig[];
    parking: string;
    directions: string;
  };
}

function env(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

function or(dbVal: string | null | undefined, envVal: string): string {
  return dbVal && dbVal.trim() ? dbVal : envVal;
}

function formatFullDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDeadlineDisplay(iso: string): string {
  if (!iso) return env("NEXT_PUBLIC_RSVP_DEADLINE_DISPLAY", "");
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function getWeddingConfig(): Promise<WeddingConfig> {
  const db = getDb();

  const [settings] = await db.select().from(weddingSettings).limit(1);
  const hotelRows = await db
    .select()
    .from(hotels)
    .orderBy(hotels.sortOrder);

  const s = settings;
  const weddingDateIso = or(s?.weddingDate, env("NEXT_PUBLIC_DATE_ISO", "2027-01-01"));

  const partner1 = or(s?.partner1Name, env("NEXT_PUBLIC_PARTNER1", "Partner One"));
  const partner2 = or(s?.partner2Name, env("NEXT_PUBLIC_PARTNER2", "Partner Two"));

  const rsvpDeadlineIso = or(s?.rsvpDeadline, env("NEXT_PUBLIC_RSVP_DEADLINE_ISO", "").replace(/T.*$/, ""));

  const hotelList: HotelConfig[] =
    hotelRows.length > 0
      ? hotelRows.map((h) => ({
          id: h.id,
          name: h.name,
          address: h.address ?? "",
          phone: h.phone ?? "",
          notes: h.notes ?? "",
          bookingUrl: h.bookingUrl ?? "",
        }))
      : [1, 2]
          .map((n) => ({
            id: n,
            name: env(`NEXT_PUBLIC_HOTEL${n}_NAME`, ""),
            address: env(`NEXT_PUBLIC_HOTEL${n}_ADDRESS`, ""),
            phone: env(`NEXT_PUBLIC_HOTEL${n}_PHONE`, ""),
            notes: env(`NEXT_PUBLIC_HOTEL${n}_NOTES`, ""),
            bookingUrl: env(`NEXT_PUBLIC_HOTEL${n}_BOOKING_URL`, "#"),
          }))
          .filter((h) => h.name);

  return {
    couple: { partner1, partner2 },
    date: {
      full: or(null, env("NEXT_PUBLIC_DATE_FULL", formatFullDate(weddingDateIso))),
      short: or(null, env("NEXT_PUBLIC_DATE_SHORT", formatShortDate(weddingDateIso))),
      iso: weddingDateIso,
    },
    time: {
      ceremony: or(s?.ceremonyTime, env("NEXT_PUBLIC_TIME_CEREMONY", "4:00 PM")),
      reception: or(s?.receptionTime, env("NEXT_PUBLIC_TIME_RECEPTION", "5:30 PM")),
    },
    venue: {
      name: or(s?.venueName, env("NEXT_PUBLIC_VENUE_NAME", "Venue Name")),
      address: or(s?.venueAddress, env("NEXT_PUBLIC_VENUE_ADDRESS", "123 Venue St")),
      city: or(s?.venueCity, env("NEXT_PUBLIC_VENUE_CITY", "City")),
      state: or(s?.venueState, env("NEXT_PUBLIC_VENUE_STATE", "ST")),
      zip: or(s?.venueZip, env("NEXT_PUBLIC_VENUE_ZIP", "00000")),
      mapUrl: or(s?.venueMapUrl, env("NEXT_PUBLIC_VENUE_MAP_URL", "#")),
    },
    dressCode: or(s?.dressCode, env("NEXT_PUBLIC_DRESS_CODE", "Semi-formal / Cocktail Attire")),
    rsvpDeadline: {
      display: formatDeadlineDisplay(rsvpDeadlineIso),
      iso: rsvpDeadlineIso
        ? rsvpDeadlineIso + "T23:59:59Z"
        : env("NEXT_PUBLIC_RSVP_DEADLINE_ISO", "2026-12-01T23:59:59Z"),
    },
    travel: {
      hotels: hotelList,
      parking: or(s?.parking, env("NEXT_PUBLIC_PARKING_INFO", "Parking details coming soon.")),
      directions: or(s?.directions, env("NEXT_PUBLIC_DIRECTIONS", "Directions coming soon.")),
    },
  };
}
