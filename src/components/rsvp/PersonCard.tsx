"use client";

import AttendanceToggle from "./AttendanceToggle";

interface PersonCardProps {
  name: string;
  attending: "attending" | "not_attending" | "";
  onChange: (value: "attending" | "not_attending") => void;
  label?: string;
}

export default function PersonCard({
  name,
  attending,
  onChange,
  label,
}: PersonCardProps) {
  return (
    <div className="py-5 border-b border-sand/50">
      {label && (
        <p className="text-lg uppercase tracking-[0.2em] text-gold mb-1 font-body">
          {label}
        </p>
      )}
      <p className="font-heading text-xl text-ink font-light mb-3">{name}</p>

      <AttendanceToggle value={attending} onChange={onChange} />
    </div>
  );
}
