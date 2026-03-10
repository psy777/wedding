"use client";

import Input from "@/components/ui/Input";

interface PlusOneSectionProps {
  plusOneName: string;
  plusOneAttending: "attending" | "not_attending" | "";
  onNameChange: (name: string) => void;
  onAttendingChange: (value: "attending" | "not_attending" | "") => void;
}

export default function PlusOneSection({
  plusOneName,
  plusOneAttending,
  onNameChange,
  onAttendingChange,
}: PlusOneSectionProps) {
  return (
    <div className="p-5 bg-stone-50 rounded-lg border border-stone-200">
      <p className="text-xs uppercase tracking-wider text-stone-400 mb-1">
        Plus One
      </p>
      <p className="text-sm text-stone-600 mb-3">
        You&apos;re welcome to bring a guest!
      </p>

      <div className="space-y-3">
        <Input
          label="Guest Name"
          placeholder="Enter your guest's full name"
          value={plusOneName}
          onChange={(e) => onNameChange(e.target.value)}
        />

        {plusOneName.trim() && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onAttendingChange("attending")}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 border ${
                plusOneAttending === "attending"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-stone-600 border-stone-300 hover:border-green-600 hover:text-green-600"
              }`}
            >
              Attending
            </button>
            <button
              type="button"
              onClick={() => onAttendingChange("not_attending")}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 border ${
                plusOneAttending === "not_attending"
                  ? "bg-stone-600 text-white border-stone-600"
                  : "bg-white text-stone-600 border-stone-300 hover:border-stone-600"
              }`}
            >
              Not Attending
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
