import { getAllHouseholds } from "@/lib/google-sheets";
import GuestListSection from "@/components/plan/GuestListSection";

export default async function GuestsPage() {
  const households = await getAllHouseholds();

  return <GuestListSection households={households} />;
}
