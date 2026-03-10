"use client";

import { WEDDING } from "@/config/wedding";

interface TOSSectionProps {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
}

export default function TOSSection({ accepted, onChange }: TOSSectionProps) {
  return (
    <div className="p-5 bg-stone-50 rounded-lg border border-stone-200">
      <p className="text-xs uppercase tracking-wider text-stone-400 mb-3">
        Terms & Conditions
      </p>

      <div className="h-48 overflow-y-auto p-4 bg-white rounded border border-stone-200 text-sm text-stone-600 leading-relaxed whitespace-pre-line mb-4">
        {WEDDING.tos}
      </div>

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-stone-300 text-stone-800 focus:ring-stone-400 cursor-pointer"
        />
        <span className="text-sm text-stone-700 group-hover:text-stone-900 transition-colors">
          I have read and agree to the terms and conditions on behalf of myself
          and all members of my household listed in this RSVP.
        </span>
      </label>
    </div>
  );
}
