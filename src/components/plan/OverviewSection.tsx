"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/planning-data";

interface RSVPStats {
  totalHouseholds: number;
  responded: number;
  attending: number;
  declined: number;
  pendingHouseholds: number;
}

interface Props {
  stats: {
    checklistTotal: number;
    checklistCompleted: number;
    totalBudget: number;
    totalEstimated: number;
    totalSpent: number;
    tableCount: number;
    guestCount: number;
    totalCapacity: number;
  };
  upcoming: { id: number; title: string; dueDateISO: string }[];
}

export default function OverviewSection({ stats, upcoming }: Props) {
  const [rsvpStats, setRsvpStats] = useState<RSVPStats | null>(null);

  useEffect(() => {
    fetch("/api/plan/rsvp-stats")
      .then((r) => r.json())
      .then((r) => {
        if (r.success) setRsvpStats(r.data);
      })
      .catch(() => {});
  }, []);

  const pct = stats.checklistTotal > 0
    ? Math.round((stats.checklistCompleted / stats.checklistTotal) * 100)
    : 0;
  const budgetRemaining = stats.totalBudget - stats.totalSpent;

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    });

  const now = new Date();

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tasks Completed"
          value={`${stats.checklistCompleted} / ${stats.checklistTotal}`}
          sub={`${pct}%`}
        />
        <StatCard
          label="Budget Spent"
          value={fmt(stats.totalSpent)}
          sub={
            stats.totalBudget > 0
              ? `${fmt(budgetRemaining)} remaining`
              : "No budget set"
          }
        />
        <StatCard
          label="Guests Seated"
          value={`${stats.guestCount}`}
          sub={`${stats.tableCount} tables, ${stats.totalCapacity} capacity`}
        />
        {rsvpStats ? (
          <StatCard
            label="RSVPs"
            value={`${rsvpStats.attending} attending`}
            sub={`${rsvpStats.responded} of ${rsvpStats.totalHouseholds} households`}
          />
        ) : (
          <StatCard label="RSVPs" value="--" sub="Loading..." />
        )}
      </div>

      {/* Budget Progress Bar */}
      {stats.totalBudget > 0 && (
        <div className="bg-white rounded-lg border border-stone-200 p-5">
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="font-heading text-lg text-stone-800">
              Budget Overview
            </h3>
            <span className="text-sm text-stone-500">
              {fmt(stats.totalSpent)} of {fmt(stats.totalBudget)}
            </span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                stats.totalSpent > stats.totalBudget
                  ? "bg-red-600"
                  : stats.totalSpent > stats.totalBudget * 0.9
                    ? "bg-amber-500"
                    : "bg-green-600"
              }`}
              style={{
                width: `${Math.min(100, (stats.totalSpent / stats.totalBudget) * 100)}%`,
              }}
            />
          </div>
          {stats.totalEstimated > 0 && (
            <p className="text-xs text-stone-400 mt-2">
              Total estimated: {fmt(stats.totalEstimated)}
            </p>
          )}
        </div>
      )}

      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-lg border border-stone-200 p-5">
        <h3 className="font-heading text-lg text-stone-800 mb-4">
          Upcoming Deadlines
        </h3>
        {upcoming.length === 0 ? (
          <p className="text-stone-400 text-sm">All tasks completed!</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {upcoming.map((item) => {
              const dueDate = new Date(item.dueDateISO);
              const overdue = dueDate < now;
              const soon =
                !overdue &&
                dueDate.getTime() - now.getTime() <
                  14 * 24 * 60 * 60 * 1000;
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-sm text-stone-700">{item.title}</span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ml-3 ${
                      overdue
                        ? "bg-red-50 text-red-600"
                        : soon
                          ? "bg-amber-50 text-amber-600"
                          : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {formatDate(dueDate)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* RSVP Breakdown */}
      {rsvpStats && rsvpStats.totalHouseholds > 0 && (
        <div className="bg-white rounded-lg border border-stone-200 p-5">
          <h3 className="font-heading text-lg text-stone-800 mb-4">
            RSVP Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold text-green-600">
                {rsvpStats.attending}
              </p>
              <p className="text-xs text-stone-500">Attending</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-stone-400">
                {rsvpStats.declined}
              </p>
              <p className="text-xs text-stone-500">Declined</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-amber-500">
                {rsvpStats.pendingHouseholds}
              </p>
              <p className="text-xs text-stone-500">Pending Households</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-stone-800">
                {rsvpStats.totalHouseholds}
              </p>
              <p className="text-xs text-stone-500">Total Households</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-stone-200 p-4">
      <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-xl font-semibold text-stone-800">{value}</p>
      <p className="text-xs text-stone-500 mt-1">{sub}</p>
    </div>
  );
}
