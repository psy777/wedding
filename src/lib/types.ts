export interface HouseholdData {
  rowIndex: number;
  householdCode: string;
  headOfHousehold: string;
  familyMembers: string[];
  plusOneAllowed: boolean;
  maxChildren: number | null;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  // RSVP response fields (populated if already submitted)
  headAttending: "attending" | "not_attending" | "";
  familyAttending: string[];
  plusOneName: string;
  plusOneAttending: "attending" | "not_attending" | "";
  childrenNames: string[];
  childrenCount: number;
  dietaryNotes: string;
  tosAccepted: boolean;
  submittedAt: string;
  updatedAt: string;
}

export interface LookupResponse {
  success: boolean;
  data?: HouseholdData;
  alreadySubmitted?: boolean;
  error?: string;
}

export interface RSVPFormState {
  headAttending: "attending" | "not_attending" | "";
  familyAttending: Record<string, "attending" | "not_attending" | "">;
  plusOneName: string;
  plusOneAttending: "attending" | "not_attending" | "";
  childrenNames: string[];
  childrenCount: number;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  dietaryNotes: string;
  tosAccepted: boolean;
}

export type RSVPFormAction =
  | { type: "SET_HEAD_ATTENDING"; value: "attending" | "not_attending" }
  | { type: "SET_FAMILY_ATTENDING"; member: string; value: "attending" | "not_attending" }
  | { type: "SET_PLUS_ONE_NAME"; value: string }
  | { type: "SET_PLUS_ONE_ATTENDING"; value: "attending" | "not_attending" | "" }
  | { type: "SET_CHILDREN_COUNT"; value: number }
  | { type: "SET_CHILD_NAME"; index: number; value: string }
  | { type: "SET_PHONE"; value: string }
  | { type: "SET_STREET_ADDRESS"; value: string }
  | { type: "SET_CITY"; value: string }
  | { type: "SET_STATE"; value: string }
  | { type: "SET_ZIP"; value: string }
  | { type: "SET_DIETARY_NOTES"; value: string }
  | { type: "SET_TOS_ACCEPTED"; value: boolean }
  | { type: "INIT"; state: RSVPFormState };

export interface SubmitPayload {
  householdCode: string;
  rowIndex: number;
  formData: RSVPFormState;
}

export interface SubmitResponse {
  success: boolean;
  error?: string;
}
