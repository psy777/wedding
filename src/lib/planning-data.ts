// ── Types ──────────────────────────────────────────────────────────

export interface ChecklistItemTemplate {
  id: string;
  title: string;
  category: string;
  monthsBefore: number;
}

export interface ChecklistProgress {
  [itemId: string]: { completed: boolean; notes: string };
}

export interface BudgetItem {
  id: string;
  category: string;
  name: string;
  estimated: number;
  actual: number;
  paid: boolean;
}

export interface SeatingTable {
  id: string;
  name: string;
  capacity: number;
  guests: string[];
}

export interface PlanningState {
  weddingDate: string;
  checklistProgress: ChecklistProgress;
  customChecklistItems: ChecklistItemTemplate[];
  budget: {
    totalBudget: number;
    items: BudgetItem[];
  };
  seating: {
    tables: SeatingTable[];
    unassignedGuests: string[];
  };
}

// ── Helpers ────────────────────────────────────────────────────────

export function getDefaultState(defaultDate?: string): PlanningState {
  return {
    weddingDate: defaultDate || "2027-01-01",
    checklistProgress: {},
    customChecklistItems: [],
    budget: { totalBudget: 0, items: [] },
    seating: { tables: [], unassignedGuests: [] },
  };
}

export function getDueDate(weddingDateISO: string, monthsBefore: number): Date {
  const wedding = new Date(weddingDateISO + "T00:00:00");
  const wholeMonths = Math.floor(monthsBefore);
  const remainingDays = Math.round((monthsBefore - wholeMonths) * 30);
  const due = new Date(wedding);
  due.setMonth(due.getMonth() - wholeMonths);
  due.setDate(due.getDate() - remainingDays);
  return due;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ── Budget Categories ──────────────────────────────────────────────

export const BUDGET_CATEGORIES = [
  "Venue & Rentals",
  "Catering & Bar",
  "Photography & Video",
  "Flowers & Decor",
  "Music & Entertainment",
  "Wedding Attire",
  "Hair & Makeup",
  "Stationery & Invitations",
  "Cake & Desserts",
  "Transportation",
  "Officiant",
  "Planner & Coordinator",
  "Rings & Jewelry",
  "Favors & Gifts",
  "Honeymoon",
  "Other",
];

// ── Checklist Template ─────────────────────────────────────────────

const RAW_CHECKLIST: {
  title: string;
  monthsBefore: number;
  category: string;
}[] = [
  // 12+ Months Before
  { title: "Set overall wedding budget", monthsBefore: 12, category: "12+ Months Before" },
  { title: "Decide on wedding date", monthsBefore: 12, category: "12+ Months Before" },
  { title: "Create initial guest list", monthsBefore: 12, category: "12+ Months Before" },
  { title: "Research and book venue", monthsBefore: 12, category: "12+ Months Before" },
  { title: "Hire wedding planner or coordinator", monthsBefore: 12, category: "12+ Months Before" },
  { title: "Start thinking about wedding party", monthsBefore: 12, category: "12+ Months Before" },
  { title: "Research vendors (photographers, caterers, etc.)", monthsBefore: 12, category: "12+ Months Before" },
  { title: "Get engagement ring insured", monthsBefore: 12, category: "12+ Months Before" },

  // 10–12 Months Before
  { title: "Book photographer", monthsBefore: 11, category: "10–12 Months Before" },
  { title: "Book videographer", monthsBefore: 11, category: "10–12 Months Before" },
  { title: "Book caterer or confirm venue catering", monthsBefore: 11, category: "10–12 Months Before" },
  { title: "Book florist", monthsBefore: 11, category: "10–12 Months Before" },
  { title: "Book band or DJ", monthsBefore: 11, category: "10–12 Months Before" },
  { title: "Finalize wedding party", monthsBefore: 10, category: "10–12 Months Before" },
  { title: "Start dress or suit shopping", monthsBefore: 10, category: "10–12 Months Before" },
  { title: "Book officiant", monthsBefore: 10, category: "10–12 Months Before" },
  { title: "Design and order save-the-dates", monthsBefore: 10, category: "10–12 Months Before" },
  { title: "Set up wedding website", monthsBefore: 10, category: "10–12 Months Before" },

  // 8–10 Months Before
  { title: "Send save-the-dates", monthsBefore: 9, category: "8–10 Months Before" },
  { title: "Book hair and makeup artists", monthsBefore: 9, category: "8–10 Months Before" },
  { title: "Order wedding dress or outfit", monthsBefore: 9, category: "8–10 Months Before" },
  { title: "Choose wedding party attire", monthsBefore: 9, category: "8–10 Months Before" },
  { title: "Start planning honeymoon", monthsBefore: 8, category: "8–10 Months Before" },
  { title: "Book transportation (limo, shuttle, etc.)", monthsBefore: 8, category: "8–10 Months Before" },
  { title: "Reserve hotel room blocks for guests", monthsBefore: 8, category: "8–10 Months Before" },
  { title: "Create wedding registry", monthsBefore: 8, category: "8–10 Months Before" },
  { title: "Schedule engagement photos", monthsBefore: 8, category: "8–10 Months Before" },

  // 6–8 Months Before
  { title: "Order wedding invitations", monthsBefore: 7, category: "6–8 Months Before" },
  { title: "Plan ceremony details (readings, music, etc.)", monthsBefore: 7, category: "6–8 Months Before" },
  { title: "Book rehearsal dinner venue", monthsBefore: 7, category: "6–8 Months Before" },
  { title: "Order partner attire (suit, tux, etc.)", monthsBefore: 7, category: "6–8 Months Before" },
  { title: "Schedule food and cake tastings", monthsBefore: 6, category: "6–8 Months Before" },
  { title: "Book honeymoon travel and accommodations", monthsBefore: 6, category: "6–8 Months Before" },
  { title: "Plan reception decorations", monthsBefore: 6, category: "6–8 Months Before" },
  { title: "Schedule engagement photos", monthsBefore: 6, category: "6–8 Months Before" },

  // 4–6 Months Before
  { title: "Send wedding invitations", monthsBefore: 5, category: "4–6 Months Before" },
  { title: "Order wedding cake", monthsBefore: 5, category: "4–6 Months Before" },
  { title: "Finalize ceremony and reception menus", monthsBefore: 5, category: "4–6 Months Before" },
  { title: "Plan reception details (centerpieces, favors)", monthsBefore: 5, category: "4–6 Months Before" },
  { title: "Purchase wedding rings", monthsBefore: 4, category: "4–6 Months Before" },
  { title: "Book wedding night hotel room", monthsBefore: 4, category: "4–6 Months Before" },
  { title: "Schedule dress fittings", monthsBefore: 4, category: "4–6 Months Before" },
  { title: "Plan bachelor and bachelorette parties", monthsBefore: 4, category: "4–6 Months Before" },
  { title: "Purchase wedding party gifts", monthsBefore: 4, category: "4–6 Months Before" },

  // 2–4 Months Before
  { title: "Start creating seating chart", monthsBefore: 3, category: "2–4 Months Before" },
  { title: "Write personal vows", monthsBefore: 3, category: "2–4 Months Before" },
  { title: "Research marriage license requirements", monthsBefore: 3, category: "2–4 Months Before" },
  { title: "Finalize reception playlist and music", monthsBefore: 3, category: "2–4 Months Before" },
  { title: "Confirm all vendor contracts and details", monthsBefore: 2, category: "2–4 Months Before" },
  { title: "Order wedding favors", monthsBefore: 2, category: "2–4 Months Before" },
  { title: "Arrange guest transportation and shuttles", monthsBefore: 2, category: "2–4 Months Before" },
  { title: "Plan welcome bags for out-of-town guests", monthsBefore: 2, category: "2–4 Months Before" },

  // 1–2 Months Before
  { title: "Final dress or suit fitting", monthsBefore: 1.5, category: "1–2 Months Before" },
  { title: "Break in wedding shoes", monthsBefore: 1.5, category: "1–2 Months Before" },
  { title: "Confirm final guest count with caterer", monthsBefore: 1, category: "1–2 Months Before" },
  { title: "Finalize seating chart", monthsBefore: 1, category: "1–2 Months Before" },
  { title: "Create day-of timeline", monthsBefore: 1, category: "1–2 Months Before" },
  { title: "Prepare rehearsal dinner details", monthsBefore: 1, category: "1–2 Months Before" },
  { title: "Arrange final vendor payments", monthsBefore: 1, category: "1–2 Months Before" },
  { title: "Get marriage license", monthsBefore: 1, category: "1–2 Months Before" },
  { title: "Confirm honeymoon reservations", monthsBefore: 1, category: "1–2 Months Before" },

  // 2–4 Weeks Before
  { title: "Confirm final details with all vendors", monthsBefore: 0.75, category: "2–4 Weeks Before" },
  { title: "Prepare tips and final payments for vendors", monthsBefore: 0.75, category: "2–4 Weeks Before" },
  { title: "Wedding rehearsal", monthsBefore: 0.5, category: "2–4 Weeks Before" },
  { title: "Pack for honeymoon", monthsBefore: 0.5, category: "2–4 Weeks Before" },
  { title: "Prepare emergency day-of kit", monthsBefore: 0.5, category: "2–4 Weeks Before" },
  { title: "Confirm transportation for wedding day", monthsBefore: 0.5, category: "2–4 Weeks Before" },
  { title: "Delegate day-of responsibilities", monthsBefore: 0.5, category: "2–4 Weeks Before" },

  // Week Of
  { title: "Final beauty appointments (hair, nails)", monthsBefore: 0.25, category: "Week Of" },
  { title: "Pack overnight bag for wedding night", monthsBefore: 0.25, category: "Week Of" },
  { title: "Prepare vows and readings for easy access", monthsBefore: 0.25, category: "Week Of" },
  { title: "Confirm all final details", monthsBefore: 0.25, category: "Week Of" },
  { title: "Relax and enjoy the moment!", monthsBefore: 0, category: "Wedding Day" },
];

export const CHECKLIST_TEMPLATE: ChecklistItemTemplate[] = RAW_CHECKLIST.map(
  (item) => ({
    ...item,
    id: slugify(item.title),
  })
);

export const CHECKLIST_CATEGORIES = [
  ...new Set(RAW_CHECKLIST.map((i) => i.category)),
];
