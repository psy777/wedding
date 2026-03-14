"use client";

import Input from "@/components/ui/Input";
import AttendanceToggle from "./AttendanceToggle";

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
    <div className="py-5 border-b border-sand/50">
      <p className="text-lg uppercase tracking-[0.2em] text-gold mb-1 font-body">
        Plus One
      </p>
      <p className="text-lg text-clay mb-4 font-body">
        You&apos;re welcome to bring a guest!
      </p>

      <div className="space-y-4">
        <Input
          label="Guest Name"
          placeholder="Enter your guest's full name"
          value={plusOneName}
          onChange={(e) => onNameChange(e.target.value)}
        />

        {plusOneName.trim() && (
          <AttendanceToggle
            value={plusOneAttending}
            onChange={onAttendingChange}
            acceptLabel="Attending"
            declineLabel="Not Attending"
          />
        )}
      </div>
    </div>
  );
}
