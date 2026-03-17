"use client";

import Input from "@/components/ui/input";

interface ChildrenSectionProps {
  maxChildren: number;
  childrenCount: number;
  childrenNames: string[];
  onCountChange: (count: number) => void;
  onNameChange: (index: number, name: string) => void;
}

export default function ChildrenSection({
  maxChildren,
  childrenCount,
  childrenNames,
  onCountChange,
  onNameChange,
}: ChildrenSectionProps) {
  return (
    <div className="py-5 border-b border-sand/50">
      <p className="text-lg uppercase tracking-[0.2em] text-gold mb-1 font-body">
        Children
      </p>
      {maxChildren === 0 ? (
        <p className="text-lg text-clay font-body">
          Due to venue capacity limits, we are only able to accommodate the guests
          specifically named on your invitation.
        </p>
      ) : (
        <>
          <p className="text-lg text-clay mb-4 font-body">
            You may bring up to {maxChildren} child{maxChildren !== 1 ? "ren" : ""}.
          </p>

          <div className="space-y-4">
            {/* Counter */}
            <div className="flex items-center gap-4">
              <label className="text-lg font-medium text-ink font-body">
                How many children will attend?
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onCountChange(Math.max(0, childrenCount - 1))}
                  className="w-8 h-8 flex items-center justify-center border border-sand text-clay hover:border-ink hover:text-ink transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={childrenCount === 0}
                >
                  -
                </button>
                <span className="w-8 text-center font-medium text-ink font-body">
                  {childrenCount}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onCountChange(Math.min(maxChildren, childrenCount + 1))
                  }
                  className="w-8 h-8 flex items-center justify-center border border-sand text-clay hover:border-ink hover:text-ink transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={childrenCount >= maxChildren}
                >
                  +
                </button>
              </div>
            </div>

            {/* Name inputs */}
            {childrenCount > 0 && (
              <div className="space-y-3">
                {Array.from({ length: childrenCount }).map((_, idx) => (
                  <Input
                    key={idx}
                    aria-label={`Child ${idx + 1} Name`}
                    placeholder={`Child ${idx + 1} name`}
                    value={childrenNames[idx] || ""}
                    onChange={(e) => onNameChange(idx, e.target.value)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
