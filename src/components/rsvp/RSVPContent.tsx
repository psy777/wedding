"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HouseholdData, RSVPFormState, LookupResponse, SubmitResponse } from "@/lib/types";
import CodeEntry from "@/components/rsvp/CodeEntry";
import RSVPForm from "@/components/rsvp/RSVPForm";
import SubmissionConfirmation from "@/components/rsvp/SubmissionConfirmation";

type Step = "code" | "form" | "confirmation";

export default function RSVPContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("code");
  const [household, setHousehold] = useState<HouseholdData | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const handleLookup = useCallback(async (code: string) => {
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
  }, []);

  // Auto-lookup if code is provided in URL
  useEffect(() => {
    const code = searchParams.get("code");
    if (code && step === "code" && !lookupLoading) {
      handleLookup(code);
    }
  }, [searchParams, step, lookupLoading, handleLookup]);

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
    </>
  );
}
