"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckSquare,
  DollarSign,
  Users,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/plan", label: "Overview", icon: LayoutDashboard },
  { href: "/plan/checklist", label: "Checklist", icon: CheckSquare },
  { href: "/plan/budget", label: "Budget", icon: DollarSign },
  { href: "/plan/seating", label: "Seating", icon: Users },
  { href: "/plan/settings", label: "Settings", icon: Settings },
];

export default function PlanNav() {
  const pathname = usePathname();

  return (
    <nav className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mb-6">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
