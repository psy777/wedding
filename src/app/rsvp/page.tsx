"use client";

import { useState } from "react";
import { HouseholdData, RSVPFormState, LookupResponse, SubmitResponse } from "@/lib/types";
import Navbar from "@/components/ui/Navbar";
import CodeEntry from "@/components/rsvp/CodeEntry";
import RSVPForm from "@/components/rsvp/RSVPForm";
import SubmissionConfirmation from "@/components/rsvp/SubmissionConfirmation";

type Step = "code" | "form" | "confirmation";

export default function RSVPPage() {
  const [step, setStep] = useState<Step>("code");
  const [household, setHousehold] = useState<HouseholdData | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const handleLookup = async (code: string) => {
    setLookupLoading(true);
    setLookupError("");

    try {
      const res = await fetch("/api/rsvp/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data: LookupResponse = await res.json();

      if (!data.success || !data.data) {
        setLookupError(data.error || "Code not found.");
        return;
      }

      setHousehold(data.data);
      setAlreadySubmitted(!!data.alreadySubmitted);
      setStep("form");
    } catch {
      setLookupError("Something went wrong. Please try again.");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (formData: RSVPFormState) => {
    if (!household) return;

    const res = await fetch("/api/rsvp/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        householdCode: household.householdCode,
        rowIndex: household.rowIndex,
        formData,
      }),
    });

    const data: SubmitResponse = await res.json();

    if (!data.success) {
      throw new Error(data.error || "Submission failed.");
    }

    setStep("confirmation");
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-stone-50 pt-24 pb-16 px-4">
        {step === "code" && (
          <CodeEntry
            onLookup={handleLookup}
            loading={lookupLoading}
            error={lookupError}
          />
        )}

        {step === "form" && household && (
          <RSVPForm
            household={household}
            alreadySubmitted={alreadySubmitted}
            onSubmit={handleSubmit}
          />
        )}

        {step === "confirmation" && household && (
          <SubmissionConfirmation
            name={household.headOfHousehold}
            isUpdate={alreadySubmitted}
          />
        )}
      </main>
    </>
  );
}
