"use client";

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
    <div className="p-5 bg-stone-50 rounded-lg border border-stone-200">
      {label && (
        <p className="text-xs uppercase tracking-wider text-stone-400 mb-1">
          {label}
        </p>
      )}
      <p className="font-semibold text-stone-800 mb-3">{name}</p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange("attending")}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 border ${
            attending === "attending"
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-stone-600 border-stone-300 hover:border-green-600 hover:text-green-600"
          }`}
        >
          Joyfully Accepts
        </button>
        <button
          type="button"
          onClick={() => onChange("not_attending")}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 border ${
            attending === "not_attending"
              ? "bg-stone-600 text-white border-stone-600"
              : "bg-white text-stone-600 border-stone-300 hover:border-stone-600"
          }`}
        >
          Regretfully Declines
        </button>
      </div>
    </div>
  );
}
