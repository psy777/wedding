import { getDb } from "@/db";
import { weddingSettings, hotels } from "@/db/schema";
import SettingsForm from "@/components/plan/SettingsForm";

export default async function SettingsPage() {
  const db = getDb();

  const [settings] = await db.select().from(weddingSettings).limit(1);
  const hotelRows = await db.select().from(hotels).orderBy(hotels.sortOrder);

  const s = settings;

  return (
    <SettingsForm
      settings={{
        partner1Name: s?.partner1Name ?? "",
        partner2Name: s?.partner2Name ?? "",
        weddingDate: s?.weddingDate ?? "2027-01-01",
        ceremonyTime: s?.ceremonyTime ?? "",
        receptionTime: s?.receptionTime ?? "",
        venueName: s?.venueName ?? "",
        venueAddress: s?.venueAddress ?? "",
        venueCity: s?.venueCity ?? "",
        venueState: s?.venueState ?? "",
        venueZip: s?.venueZip ?? "",
        venueMapUrl: s?.venueMapUrl ?? "",
        totalBudget: s?.totalBudget ?? 0,
        rsvpDeadline: s?.rsvpDeadline ?? "",
        dressCode: s?.dressCode ?? "",
        directions: s?.directions ?? "",
        parking: s?.parking ?? "",
      }}
      hotels={hotelRows.map((h) => ({
        id: h.id,
        name: h.name,
        address: h.address ?? "",
        phone: h.phone ?? "",
        notes: h.notes ?? "",
        bookingUrl: h.bookingUrl ?? "",
      }))}
    />
  );
}
