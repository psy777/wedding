"use client";

import { useReducer, useState } from "react";
import { HouseholdData, RSVPFormState, RSVPFormAction } from "@/lib/types";
import PersonCard from "./PersonCard";
import PlusOneSection from "./PlusOneSection";
import ChildrenSection from "./ChildrenSection";
import AddressFields from "./AddressFields";
import TOSSection from "./TOSSection";
import Button from "@/components/ui/Button";
import { inputBaseStyles } from "@/components/ui/Input";
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
      : Array(household.maxChildren).fill(""),
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

  const canSubmit =
    state.headAttending !== "" && state.tosAccepted && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError("");

    try {
      await onSubmit(state);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto animate-fade-in-up">
      {/* Greeting */}
      <div className="text-center mb-10">
        <p className="text-lg uppercase tracking-[0.3em] text-gold mb-3 font-body">
          Your Response
        </p>
        <h2 className="font-heading text-3xl text-ink font-light mb-2">
          Welcome, {household.headOfHousehold}
        </h2>
        {alreadySubmitted && (
          <p className="text-gold text-lg font-body">
            You&apos;ve already submitted your RSVP. Feel free to update your response below.
          </p>
        )}
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
        {household.familyMembers.map((member) => (
          <PersonCard
            key={member}
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
        {household.maxChildren > 0 && (
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
          phone={state.phone}
          streetAddress={state.streetAddress}
          city={state.city}
          state={state.state}
          zip={state.zip}
          onPhoneChange={(value) => dispatch({ type: "SET_PHONE", value })}
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
            className={cn(...inputBaseStyles, "resize-none")}
          />
        </div>

        {/* TOS */}
        <TOSSection
          accepted={state.tosAccepted}
          onChange={(value) =>
            dispatch({ type: "SET_TOS_ACCEPTED", value })
          }
        />

        {/* Submit */}
        {error && (
          <p className="text-wine text-lg text-center mt-6">{error}</p>
        )}

        <div className="mt-8">
          <Button
            type="submit"
            loading={submitting}
            disabled={!canSubmit}
            className="w-full text-xl py-4"
          >
            {alreadySubmitted ? "Update RSVP" : "Submit RSVP"}
          </Button>
        </div>
      </div>
    </form>
  );
}
