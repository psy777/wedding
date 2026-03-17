"use client";

import { useReducer, useState, useCallback } from "react";
import { HouseholdData, RSVPFormState, RSVPFormAction } from "@/lib/types";
import PersonCard from "./PersonCard";
import PlusOneSection from "./PlusOneSection";
import ChildrenSection from "./ChildrenSection";
import AddressFields from "./AddressFields";
import Link from "next/link";
import Button from "@/components/ui/button";
import { inputBaseStyles } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RSVPFormProps {
  household: HouseholdData;
  alreadySubmitted: boolean;
  onSubmit: (formData: RSVPFormState) => Promise<void>;
}

function formReducer(state: RSVPFormState, action: RSVPFormAction): RSVPFormState {
  switch (action.type) {
    case "SET_HEAD_ATTENDING":
      return { ...state, headAttending: action.value };
    case "SET_FAMILY_ATTENDING":
      return {
        ...state,
        familyAttending: { ...state.familyAttending, [action.member]: action.value },
      };
    case "SET_PLUS_ONE_NAME":
      return { ...state, plusOneName: action.value };
    case "SET_PLUS_ONE_ATTENDING":
      return { ...state, plusOneAttending: action.value };
    case "SET_CHILDREN_COUNT":
      return { ...state, childrenCount: action.value };
    case "SET_CHILD_NAME": {
      const names = [...state.childrenNames];
      names[action.index] = action.value;
      return { ...state, childrenNames: names };
    }
    case "SET_PHONE":
      return { ...state, phone: action.value };
    case "SET_STREET_ADDRESS":
      return { ...state, streetAddress: action.value };
    case "SET_CITY":
      return { ...state, city: action.value };
    case "SET_STATE":
      return { ...state, state: action.value };
    case "SET_ZIP":
      return { ...state, zip: action.value };
    case "SET_DIETARY_NOTES":
      return { ...state, dietaryNotes: action.value };
    case "SET_TOS_ACCEPTED":
      return { ...state, tosAccepted: action.value };
    case "INIT":
      return action.state;
    default:
      return state;
  }
}

function buildInitialState(household: HouseholdData): RSVPFormState {
  const familyAttending: Record<string, "attending" | "not_attending" | ""> = {};
  household.familyMembers.forEach((member, idx) => {
    familyAttending[member] =
      (household.familyAttending[idx] as "attending" | "not_attending" | "") || "";
  });

  return {
    headAttending: household.headAttending,
    familyAttending,
    plusOneName: household.plusOneName,
    plusOneAttending: household.plusOneAttending,
    childrenNames: household.childrenNames.length > 0
      ? household.childrenNames
      : Array(household.maxChildren ?? 0).fill(""),
    childrenCount: household.childrenCount,
    phone: household.phone,
    streetAddress: household.streetAddress,
    city: household.city,
    state: household.state,
    zip: household.zip,
    dietaryNotes: household.dietaryNotes,
    tosAccepted: household.tosAccepted,
  };
}

export default function RSVPForm({
  household,
  alreadySubmitted,
  onSubmit,
}: RSVPFormProps) {
  const [state, dispatch] = useReducer(
    formReducer,
    household,
    buildInitialState
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [addressSuggestion, setAddressSuggestion] = useState<{
    street: string; city: string; state: string; zip: string;
  } | null>(null);
  const [addressInvalid, setAddressInvalid] = useState(false);

  const canSubmit =
    state.headAttending !== "" &&
    state.streetAddress.trim() !== "" &&
    state.city.trim() !== "" &&
    state.state.trim() !== "" &&
    state.zip.trim() !== "" &&
    !submitting;

  const submitRSVP = useCallback(async (formState: RSVPFormState) => {
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(formState);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setSubmitting(false);
    }
  }, [onSubmit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError("");
    setAddressSuggestion(null);
    setAddressInvalid(false);

    try {
      const res = await fetch("/api/address/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          street: state.streetAddress,
          city: state.city,
          state: state.state,
          zip: state.zip,
        }),
      });

      const result = await res.json();

      if (!result.valid) {
        setAddressInvalid(true);
        setSubmitting(false);
        return;
      }

      if (result.suggested) {
        setAddressSuggestion(result.suggested);
        setSubmitting(false);
        return;
      }

      await submitRSVP(state);
    } catch {
      // Validation failed to reach API — submit anyway
      await submitRSVP(state);
    }
  };

  const handleUseSuggested = async () => {
    if (!addressSuggestion) return;
    dispatch({ type: "SET_STREET_ADDRESS", value: addressSuggestion.street });
    dispatch({ type: "SET_CITY", value: addressSuggestion.city });
    dispatch({ type: "SET_STATE", value: addressSuggestion.state });
    dispatch({ type: "SET_ZIP", value: addressSuggestion.zip });
    setAddressSuggestion(null);
    await submitRSVP({
      ...state,
      streetAddress: addressSuggestion.street,
      city: addressSuggestion.city,
      state: addressSuggestion.state,
      zip: addressSuggestion.zip,
    });
  };

  const handleKeepOriginal = async () => {
    setAddressSuggestion(null);
    await submitRSVP(state);
  };

  const handleSubmitAnywayInvalid = async () => {
    setAddressInvalid(false);
    await submitRSVP(state);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto animate-fade-in-up">
      {/* Greeting */}
      <div className="text-center mb-10">
        <h2 className="font-heading text-3xl text-ink font-light mb-2">
          Welcome, {household.headOfHousehold}
        </h2>
        {alreadySubmitted && (
          <p className="text-gold text-lg font-body">
            You&apos;ve already submitted your RSVP. Feel free to update your response below.
          </p>
        )}
        {household.maxChildren === 0 && (() => {
          const seatCount = 1 + household.familyMembers.length + (household.plusOneAllowed ? 1 : 0);
          return (
            <p className="text-lg text-ink font-body mt-4">
              <span className="text-gold">✿</span>{" "}
              We are so excited to celebrate with you! We have reserved{" "}
              {seatCount} {seatCount === 1 ? "seat" : "seats"} in your honor.{" "}
              <span className="text-gold">✿</span>
            </p>
          );
        })()}
      </div>

      <div>
        {/* Head of household */}
        <PersonCard
          name={household.headOfHousehold}
          attending={state.headAttending}
          onChange={(value) =>
            dispatch({ type: "SET_HEAD_ATTENDING", value })
          }
          label="Head of Household"
        />

        {/* Family members */}
        {household.familyMembers.map((member, idx) => (
          <PersonCard
            key={`${member}-${idx}`}
            name={member}
            attending={state.familyAttending[member] || ""}
            onChange={(value) =>
              dispatch({ type: "SET_FAMILY_ATTENDING", member, value })
            }
            label="Family Member"
          />
        ))}

        {/* Plus one */}
        {household.plusOneAllowed && (
          <PlusOneSection
            plusOneName={state.plusOneName}
            plusOneAttending={state.plusOneAttending}
            onNameChange={(value) =>
              dispatch({ type: "SET_PLUS_ONE_NAME", value })
            }
            onAttendingChange={(value) =>
              dispatch({ type: "SET_PLUS_ONE_ATTENDING", value })
            }
          />
        )}

        {/* Children */}
        {household.maxChildren !== null && (
          <ChildrenSection
            maxChildren={household.maxChildren}
            childrenCount={state.childrenCount}
            childrenNames={state.childrenNames}
            onCountChange={(value) =>
              dispatch({ type: "SET_CHILDREN_COUNT", value })
            }
            onNameChange={(index, value) =>
              dispatch({ type: "SET_CHILD_NAME", index, value })
            }
          />
        )}

        {/* Address fields */}
        <AddressFields
          streetAddress={state.streetAddress}
          city={state.city}
          state={state.state}
          zip={state.zip}
          onStreetChange={(value) =>
            dispatch({ type: "SET_STREET_ADDRESS", value })
          }
          onCityChange={(value) => dispatch({ type: "SET_CITY", value })}
          onStateChange={(value) => dispatch({ type: "SET_STATE", value })}
          onZipChange={(value) => dispatch({ type: "SET_ZIP", value })}
        />

        {/* Dietary notes */}
        <div className="py-5 border-b border-sand/50">
          <p className="text-lg uppercase tracking-[0.2em] text-gold mb-4 font-body">
            Dietary Restrictions
          </p>
          <textarea
            value={state.dietaryNotes}
            onChange={(e) =>
              dispatch({ type: "SET_DIETARY_NOTES", value: e.target.value })
            }
            placeholder="Any food allergies or dietary restrictions we should know about?"
            rows={3}
            className={cn(...inputBaseStyles, "resize-none bg-linen/60 w-full")}
          />
        </div>

        {/* Address suggestion */}
        {addressSuggestion && (
          <div className="mt-6 p-5 border border-gold/50 bg-linen/80">
            <p className="text-lg font-body text-ink mb-3">
              Did you mean this address?
            </p>
            <div className="mb-4 p-3 bg-white/60 border border-sand/50 text-ink font-body">
              <p>{addressSuggestion.street}</p>
              <p>{addressSuggestion.city}, {addressSuggestion.state} {addressSuggestion.zip}</p>
            </div>
            <div className="flex gap-3">
              <Button type="button" onClick={handleUseSuggested} className="flex-1 py-2">
                Use Suggested
              </Button>
              <Button type="button" onClick={handleKeepOriginal} className="flex-1 py-2 bg-transparent border border-sand text-clay hover:border-ink hover:text-ink">
                Keep Mine
              </Button>
            </div>
          </div>
        )}

        {/* Invalid address warning */}
        {addressInvalid && (
          <div className="mt-6 p-5 border border-wine/30 bg-linen/80">
            <p className="text-lg font-body text-ink mb-3">
              We couldn&apos;t verify that address. Please double-check it, or submit as-is.
            </p>
            <div className="flex gap-3">
              <Button type="button" onClick={() => setAddressInvalid(false)} className="flex-1 py-2">
                Edit Address
              </Button>
              <Button type="button" onClick={handleSubmitAnywayInvalid} className="flex-1 py-2 bg-transparent border border-sand text-clay hover:border-ink hover:text-ink">
                Submit Anyway
              </Button>
            </div>
          </div>
        )}

        {/* Submit */}
        {error && (
          <p className="text-wine text-lg text-center mt-6">{error}</p>
        )}

        <div className="mt-8 flex flex-col items-center">
          <p className="text-sm text-clay text-center mb-3 font-body">
            By submitting your RSVP, you agree to our{" "}
            <Link href="/event-policies" className="text-gold underline hover:text-ink transition-colors duration-300">
              Event Policies
            </Link>
            .
          </p>
          <Button
            type="submit"
            disabled={submitting || !canSubmit}
            className="text-xl py-5 px-12"
          >
            {submitting ? "Submitting..." : alreadySubmitted ? "Update RSVP" : "Submit RSVP"}
          </Button>
        </div>
      </div>
    </form>
  );
}
