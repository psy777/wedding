"use client";

import { useState, useMemo } from "react";
import type { HouseholdData } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";

type Filter = "all" | "attending" | "not_attending" | "pending";

interface Props {
  households: HouseholdData[];
}

function getHouseholdStatus(h: HouseholdData): "attending" | "not_attending" | "pending" {
  if (!h.submittedAt) return "pending";
  return h.headAttending === "attending" ? "attending" : "not_attending";
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
  let count = 1; // head of household
  count += h.familyMembers.length;
  if (h.plusOneAllowed) count++;
  count += h.maxChildren ?? 0;
  return count;
}

export default function GuestListSection({ households }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const stats = useMemo(() => {
    let totalInvited = 0;
    let attending = 0;
    let declined = 0;
    let pending = 0;

    for (const h of households) {
      totalInvited += getExpectedGuestCount(h);
      const status = getHouseholdStatus(h);
      if (status === "attending") {
        attending += countAttendingGuests(h);
      } else if (status === "not_attending") {
        declined += getExpectedGuestCount(h);
      } else {
        pending += getExpectedGuestCount(h);
      }
    }

    return { totalInvited, attending, declined, pending };
  }, [households]);

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

    return list;
  }, [households, filter, search]);

  const toggleFilter = (target: Filter) => {
    setFilter((prev) => (prev === target ? "all" : target));
  };

  return (
    <div className="space-y-6">
      {/* Stats cards — clickable to filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            filter === "all" ? "" : ""
          }`}
          onClick={() => setFilter("all")}
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Guest table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Household</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Guests</TableHead>
                <TableHead className="hidden md:table-cell">Dietary</TableHead>
                <TableHead className="hidden lg:table-cell">Responded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                    <TableRow key={`${h.householdCode}-${i}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {h.headOfHousehold}
                            {h.submittedAt && (
                              h.headAttending === "attending"
                                ? <span className="text-green-600 ml-1">&#10003;</span>
                                : <span className="text-red-500 ml-1">&#10005;</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{h.householdCode}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-0.5">
                          {h.familyMembers.map((m, mi) => (
                            <p key={`${m}-${mi}`} className="text-muted-foreground">
                              {m}
                              {h.submittedAt && (
                                isFamilyMemberAttending(h, mi)
                                  ? <span className="text-green-600 ml-1">&#10003;</span>
                                  : <span className="text-red-500 ml-1">&#10005;</span>
                              )}
                            </p>
                          ))}
                          {h.plusOneName && (
                            <p className="text-muted-foreground">
                              +1: {h.plusOneName}
                              {h.plusOneAttending === "attending"
                                ? <span className="text-green-600 ml-1">&#10003;</span>
                                : h.plusOneAttending === "not_attending"
                                  ? <span className="text-red-500 ml-1">&#10005;</span>
                                  : null}
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
                      <TableCell className="hidden sm:table-cell">
                        {status === "pending" ? (
                          <span className="text-muted-foreground">{expectedCount} invited</span>
                        ) : (
                          <span>
                            {attendingCount}/{expectedCount}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {h.dietaryNotes ? (
                          <span className="flex items-center gap-1 text-sm">
                            <UtensilsCrossed className="h-3 w-3 text-muted-foreground" />
                            {h.dietaryNotes}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {h.submittedAt
                          ? new Date(h.submittedAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
