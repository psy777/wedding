"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/plan", label: "Overview" },
  { href: "/plan/checklist", label: "Checklist" },
  { href: "/plan/budget", label: "Budget" },
  { href: "/plan/seating", label: "Seating" },
];

export default function PlanNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 border-b border-stone-200 mb-6 overflow-x-auto">
      {NAV_ITEMS.map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
              isActive
                ? "text-stone-800 border-b-2 border-stone-800 -mb-px"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
