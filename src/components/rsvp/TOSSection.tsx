"use client";

import { WEDDING } from "@/config/wedding";

interface TOSSectionProps {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
}

export default function TOSSection({ accepted, onChange }: TOSSectionProps) {
  return (
    <div className="py-5 border-b border-sand/50">
      <p className="text-lg uppercase tracking-[0.2em] text-gold mb-4 font-body">
        Terms &amp; Conditions
      </p>

      <div className="h-48 overflow-y-auto p-4 border border-sand bg-linen/60 text-lg text-clay leading-relaxed whitespace-pre-line mb-4 font-body">
        {WEDDING.tos}
      </div>

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 w-4 h-4 border-sand text-ink focus:ring-gold/30 cursor-pointer accent-ink"
        />
        <span className="text-lg text-clay group-hover:text-ink transition-colors duration-300 font-body">
          I have read and agree to the terms and conditions on behalf of myself
          and all members of my household listed in this RSVP.
        </span>
      </label>
    </div>
  );
}
