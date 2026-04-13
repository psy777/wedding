"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { HouseholdData } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Search,
  UtensilsCrossed,
  MessageCircle,
  MessageCircleOff,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
} from "lucide-react";
import GuestEditSheet from "./GuestEditSheet";

type Filter = "all" | "attending" | "not_attending" | "pending";

type SortField = "household" | "status" | "guests" | "responded";
type SortDirection = "asc" | "desc";
type SortState = { field: SortField; direction: SortDirection } | null;

type TextedFilter = "all" | "yes" | "no";
type DietaryFilter = "all" | "has_notes" | "no_notes";

const ALL_COLUMNS = [
  "members",
  "status",
  "guests",
  "dietary",
  "texted",
  "responded",
] as const;

type Column = (typeof ALL_COLUMNS)[number];

const COLUMN_LABELS: Record<Column, string> = {
  members: "Members",
  status: "Status",
  guests: "Guests",
  dietary: "Dietary",
  texted: "Texted",
  responded: "Responded",
};

const DEFAULT_COLUMNS: Column[] = [
  "members",
  "status",
  "guests",
  "dietary",
  "texted",
  "responded",
];

interface Props {
  households: HouseholdData[];
}

function getHouseholdStatus(h: HouseholdData): "attending" | "not_attending" | "pending" {
  if (!h.submittedAt) return "pending";
  return countAttendingGuests(h) > 0 ? "attending" : "not_attending";
}

function isFamilyMemberAttending(h: HouseholdData, index: number): boolean {
  return h.familyAttending[index] === "attending";
}

function countAttendingGuests(h: HouseholdData): number {
  let count = 0;
  if (h.headAttending === "attending") count++;
  for (let i = 0; i < h.familyMembers.length; i++) {
    if (isFamilyMemberAttending(h, i)) count++;
  }
  if (h.plusOneAttending === "attending") count++;
  count += h.childrenCount;
  return count;
}

function getAllGuestNames(h: HouseholdData): string[] {
  const names: string[] = [h.headOfHousehold];
  names.push(...h.familyMembers);
  if (h.plusOneName) names.push(h.plusOneName);
  names.push(...h.childrenNames);
  return names;
}

function getExpectedGuestCount(h: HouseholdData): number {
  let count = 1;
  count += h.familyMembers.length;
  if (h.plusOneAllowed) count++;
  count += h.maxChildren ?? 0;
  return count;
}

export default function GuestListSection({ households: initialHouseholds }: Props) {
  const [households, setHouseholds] = useState(initialHouseholds);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<HouseholdData | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<Column>>(
    () => new Set(DEFAULT_COLUMNS)
  );
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState<SortState>(null);
  const [textedFilter, setTextedFilter] = useState<TextedFilter>("all");
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>("all");
  const columnsRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    if (!columnsOpen && !filtersOpen) return;
    const handler = (e: MouseEvent) => {
      if (columnsOpen && columnsRef.current && !columnsRef.current.contains(e.target as Node)) {
        setColumnsOpen(false);
      }
      if (filtersOpen && filtersRef.current && !filtersRef.current.contains(e.target as Node)) {
        setFiltersOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [columnsOpen, filtersOpen]);

  const show = (col: Column) => visibleColumns.has(col);

  const toggleColumn = (col: Column) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  };

  const stats = useMemo(() => {
    let totalInvited = 0;
    let attending = 0;
    let declined = 0;
    let pending = 0;

    for (const h of households) {
      totalInvited += getExpectedGuestCount(h);
      if (!h.submittedAt) {
        pending += getExpectedGuestCount(h);
      } else {
        const a = countAttendingGuests(h);
        attending += a;
        declined += getExpectedGuestCount(h) - a;
      }
    }

    return { totalInvited, attending, declined, pending };
  }, [households]);

  const toggleSort = (field: SortField) => {
    setSort((prev) => {
      if (prev?.field !== field) return { field, direction: "asc" };
      if (prev.direction === "asc") return { field, direction: "desc" };
      return null;
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort?.field !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sort.direction === "asc"
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const activeFilterCount =
    (textedFilter !== "all" ? 1 : 0) + (dietaryFilter !== "all" ? 1 : 0);

  const filtered = useMemo(() => {
    let list = households;

    if (filter !== "all") {
      list = list.filter((h) => getHouseholdStatus(h) === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((h) => {
        const names = getAllGuestNames(h);
        return (
          names.some((n) => n.toLowerCase().includes(q)) ||
          h.householdCode.toLowerCase().includes(q)
        );
      });
    }

    if (textedFilter !== "all") {
      list = list.filter((h) =>
        textedFilter === "yes" ? h.texted : !h.texted
      );
    }

    if (dietaryFilter !== "all") {
      list = list.filter((h) =>
        dietaryFilter === "has_notes" ? !!h.dietaryNotes : !h.dietaryNotes
      );
    }

    if (sort) {
      const statusOrder = { attending: 0, pending: 1, not_attending: 2 };
      list = [...list].sort((a, b) => {
        let cmp = 0;
        switch (sort.field) {
          case "household":
            cmp = a.headOfHousehold.localeCompare(b.headOfHousehold);
            break;
          case "status":
            cmp = statusOrder[getHouseholdStatus(a)] - statusOrder[getHouseholdStatus(b)];
            break;
          case "guests":
            cmp = countAttendingGuests(a) - countAttendingGuests(b);
            break;
          case "responded":
            cmp = (a.submittedAt || "").localeCompare(b.submittedAt || "");
            break;
        }
        return sort.direction === "asc" ? cmp : -cmp;
      });
    }

    return list;
  }, [households, filter, search, sort, textedFilter, dietaryFilter]);

  const toggleFilter = (target: Filter) => {
    setFilter((prev) => (prev === target ? "all" : target));
  };

  const handleTextedToggle = async (
    e: React.MouseEvent,
    h: HouseholdData
  ) => {
    e.stopPropagation();
    const newValue = !h.texted;

    setHouseholds((prev) =>
      prev.map((hh) =>
        hh.householdCode === h.householdCode ? { ...hh, texted: newValue } : hh
      )
    );

    try {
      const res = await fetch("/api/plan/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rowIndex: h.rowIndex,
          householdCode: h.householdCode,
          field: "texted",
          value: newValue ? "yes" : "no",
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setHouseholds((prev) =>
          prev.map((hh) =>
            hh.householdCode === h.householdCode
              ? { ...hh, texted: !newValue }
              : hh
          )
        );
      }
    } catch {
      setHouseholds((prev) =>
        prev.map((hh) =>
          hh.householdCode === h.householdCode
            ? { ...hh, texted: !newValue }
            : hh
        )
      );
    }
  };

  const handleSaved = (updated: HouseholdData) => {
    setHouseholds((prev) =>
      prev.map((h) =>
        h.householdCode === updated.householdCode ? updated : h
      )
    );
  };

  const handleDeleted = (code: string) => {
    setHouseholds((prev) => {
      const deleted = prev.find((h) => h.householdCode === code);
      if (!deleted) return prev;
      return prev
        .filter((h) => h.householdCode !== code)
        .map((h) =>
          h.rowIndex > deleted.rowIndex
            ? { ...h, rowIndex: h.rowIndex - 1 }
            : h
        );
    });
  };

  // +1 for the always-visible Household column
  const colCount = 1 + visibleColumns.size;

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            filter === "all" ? "ring-2 ring-primary shadow-md" : ""
          }`}
          onClick={() => toggleFilter("all")}
        >
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Users className="h-4 w-4" />
              Invited
            </div>
            <p className="text-2xl font-bold">{stats.totalInvited}</p>
            <p className="text-xs text-muted-foreground">
              {households.length} household{households.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            filter === "attending" ? "ring-2 ring-green-500 shadow-md" : ""
          }`}
          onClick={() => toggleFilter("attending")}
        >
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-sm mb-1 text-green-600">
              <UserCheck className="h-4 w-4" />
              Attending
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.attending}</p>
            <p className="text-xs text-muted-foreground">
              {stats.totalInvited > 0
                ? Math.round((stats.attending / stats.totalInvited) * 100)
                : 0}
              % of invited
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            filter === "not_attending" ? "ring-2 ring-red-400 shadow-md" : ""
          }`}
          onClick={() => toggleFilter("not_attending")}
        >
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-sm mb-1 text-red-500">
              <UserX className="h-4 w-4" />
              Declined
            </div>
            <p className="text-2xl font-bold text-red-500">{stats.declined}</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            filter === "pending" ? "ring-2 ring-amber-400 shadow-md" : ""
          }`}
          onClick={() => toggleFilter("pending")}
        >
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-sm mb-1 text-amber-500">
              <Clock className="h-4 w-4" />
              Pending
            </div>
            <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">
              {households.filter((h) => !h.submittedAt).length} household
              {households.filter((h) => !h.submittedAt).length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Column selector */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="relative" ref={filtersRef}>
          <Button
            variant="outline"
            size="default"
            onClick={() => setFiltersOpen((p) => !p)}
            title="Filter columns"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
          {filtersOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded-lg border border-border bg-popover p-3 shadow-md space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Texted</p>
                <div className="flex gap-1">
                  {([["all", "All"], ["yes", "Yes"], ["no", "No"]] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setTextedFilter(val)}
                      className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                        textedFilter === val
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Dietary Notes</p>
                <div className="flex gap-1">
                  {([["all", "All"], ["has_notes", "Has Notes"], ["no_notes", "None"]] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setDietaryFilter(val)}
                      className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                        dietaryFilter === val
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setTextedFilter("all"); setDietaryFilter("all"); }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
        <div className="relative" ref={columnsRef}>
          <Button
            variant="outline"
            size="default"
            onClick={() => setColumnsOpen((p) => !p)}
            title="Toggle columns"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Columns</span>
          </Button>
          {columnsOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-lg border border-border bg-popover p-1 shadow-md">
              {ALL_COLUMNS.map((col) => (
                <label
                  key={col}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns.has(col)}
                    onChange={() => toggleColumn(col)}
                    className="rounded"
                  />
                  {COLUMN_LABELS[col]}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Guest table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button onClick={() => toggleSort("household")} className="flex items-center hover:text-foreground transition-colors">
                    Household <SortIcon field="household" />
                  </button>
                </TableHead>
                {show("members") && <TableHead>Members</TableHead>}
                {show("status") && (
                  <TableHead>
                    <button onClick={() => toggleSort("status")} className="flex items-center hover:text-foreground transition-colors">
                      Status <SortIcon field="status" />
                    </button>
                  </TableHead>
                )}
                {show("guests") && (
                  <TableHead>
                    <button onClick={() => toggleSort("guests")} className="flex items-center hover:text-foreground transition-colors">
                      Guests <SortIcon field="guests" />
                    </button>
                  </TableHead>
                )}
                {show("dietary") && <TableHead>Dietary</TableHead>}
                {show("texted") && <TableHead>Texted</TableHead>}
                {show("responded") && (
                  <TableHead>
                    <button onClick={() => toggleSort("responded")} className="flex items-center hover:text-foreground transition-colors">
                      Responded <SortIcon field="responded" />
                    </button>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={colCount} className="text-center py-8 text-muted-foreground">
                    {search || filter !== "all"
                      ? "No households match your filters."
                      : "No households found."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((h, i) => {
                  const status = getHouseholdStatus(h);
                  const attendingCount = countAttendingGuests(h);
                  const expectedCount = getExpectedGuestCount(h);

                  return (
                    <TableRow
                      key={`${h.householdCode}-${i}`}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setEditing(h)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {h.headOfHousehold}
                            {h.submittedAt &&
                              (h.headAttending === "attending" ? (
                                <span className="text-green-600 ml-1">&#10003;</span>
                              ) : (
                                <span className="text-red-500 ml-1">&#10005;</span>
                              ))}
                          </p>
                          <p className="text-xs text-muted-foreground">{h.householdCode}</p>
                        </div>
                      </TableCell>

                      {show("members") && (
                        <TableCell>
                          <div className="text-sm space-y-0.5">
                            {h.familyMembers.map((m, mi) => (
                              <p key={`${m}-${mi}`} className="text-muted-foreground">
                                {m}
                                {h.submittedAt &&
                                  (isFamilyMemberAttending(h, mi) ? (
                                    <span className="text-green-600 ml-1">&#10003;</span>
                                  ) : (
                                    <span className="text-red-500 ml-1">&#10005;</span>
                                  ))}
                              </p>
                            ))}
                            {h.plusOneName && (
                              <p className="text-muted-foreground">
                                +1: {h.plusOneName}
                                {h.plusOneAttending === "attending" ? (
                                  <span className="text-green-600 ml-1">&#10003;</span>
                                ) : h.plusOneAttending === "not_attending" ? (
                                  <span className="text-red-500 ml-1">&#10005;</span>
                                ) : null}
                              </p>
                            )}
                            {!h.plusOneName && h.plusOneAllowed && !h.submittedAt && (
                              <p className="text-muted-foreground italic text-xs">+1 allowed</p>
                            )}
                            {h.childrenNames.length > 0 && (
                              <p className="text-muted-foreground text-xs">
                                Kids: {h.childrenNames.join(", ")}
                              </p>
                            )}
                          </div>
                        </TableCell>
                      )}

                      {show("status") && (
                        <TableCell>
                          {status === "attending" && (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              Attending
                            </Badge>
                          )}
                          {status === "not_attending" && (
                            <Badge className="bg-red-50 text-red-600 border-red-200">
                              Declined
                            </Badge>
                          )}
                          {status === "pending" && (
                            <Badge className="bg-amber-50 text-amber-600 border-amber-200">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                      )}

                      {show("guests") && (
                        <TableCell>
                          {status === "pending" ? (
                            <span className="text-muted-foreground">
                              {expectedCount} invited
                              {(h.maxChildren ?? 0) > 0 && (
                                <span className="text-xs block">
                                  +{h.maxChildren} kids
                                </span>
                              )}
                            </span>
                          ) : (
                            <span>
                              {attendingCount}/{expectedCount}
                              {h.childrenCount > 0 && (
                                <span className="text-xs text-muted-foreground block">
                                  {h.childrenCount} kid{h.childrenCount !== 1 ? "s" : ""}
                                </span>
                              )}
                            </span>
                          )}
                        </TableCell>
                      )}

                      {show("dietary") && (
                        <TableCell>
                          {h.dietaryNotes ? (
                            <span className="flex items-center gap-1 text-sm">
                              <UtensilsCrossed className="h-3 w-3 text-muted-foreground" />
                              {h.dietaryNotes}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )}

                      {show("texted") && (
                        <TableCell>
                          <button
                            onClick={(e) => handleTextedToggle(e, h)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title={h.texted ? "Mark as not texted" : "Mark as texted"}
                          >
                            {h.texted ? (
                              <MessageCircle className="h-4 w-4 text-green-600 fill-green-600" />
                            ) : (
                              <MessageCircleOff className="h-4 w-4" />
                            )}
                          </button>
                        </TableCell>
                      )}

                      {show("responded") && (
                        <TableCell className="text-sm text-muted-foreground">
                          {h.submittedAt
                            ? new Date(h.submittedAt).toLocaleDateString()
                            : "—"}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit panel */}
      {editing && (
        <GuestEditSheet
          household={editing}
          open={!!editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
