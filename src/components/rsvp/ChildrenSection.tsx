"use client";

import Input from "@/components/ui/Input";

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
    <div className="p-5 bg-stone-50 rounded-lg border border-stone-200">
      <p className="text-xs uppercase tracking-wider text-stone-400 mb-1">
        Children
      </p>
      <p className="text-sm text-stone-600 mb-3">
        You may bring up to {maxChildren} child{maxChildren !== 1 ? "ren" : ""}.
      </p>

      <div className="space-y-4">
        {/* Counter */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-stone-700">
            How many children will attend?
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCountChange(Math.max(0, childrenCount - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors"
              disabled={childrenCount === 0}
            >
              -
            </button>
            <span className="w-8 text-center font-medium text-stone-800">
              {childrenCount}
            </span>
            <button
              type="button"
              onClick={() =>
                onCountChange(Math.min(maxChildren, childrenCount + 1))
              }
              className="w-8 h-8 flex items-center justify-center rounded-md border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors"
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
                label={`Child ${idx + 1} Name`}
                placeholder={`Enter child's name`}
                value={childrenNames[idx] || ""}
                onChange={(e) => onNameChange(idx, e.target.value)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
