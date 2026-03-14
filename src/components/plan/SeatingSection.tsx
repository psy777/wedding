"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addSeatingTable,
  removeSeatingTable,
  addGuest,
  removeGuest,
  moveGuest,
} from "@/actions/seating";

interface Guest {
  id: number;
  name: string;
}

interface Table {
  id: number;
  name: string;
  capacity: number;
  guests: Guest[];
}

interface Props {
  tables: Table[];
  unassignedGuests: Guest[];
}

export default function SeatingSection({
  tables: initialTables,
  unassignedGuests: initialUnassigned,
}: Props) {
  const [tables, setTables] = useState(initialTables);
  const [unassigned, setUnassigned] = useState(initialUnassigned);
  const [showAddTable, setShowAddTable] = useState(false);
  const [tableName, setTableName] = useState("");
  const [tableCapacity, setTableCapacity] = useState("8");
  const [guestInputs, setGuestInputs] = useState<Record<number, string>>({});
  const [unassignedInput, setUnassignedInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const totalSeated = tables.reduce((s, t) => s + t.guests.length, 0);
  const totalCapacity = tables.reduce((s, t) => s + t.capacity, 0);

  const handleAddTable = () => {
    if (!tableName.trim()) return;
    startTransition(async () => {
      await addSeatingTable({
        name: tableName.trim(),
        capacity: parseInt(tableCapacity) || 8,
      });
      router.refresh();
    });
    setTableName("");
    setTableCapacity("8");
    setShowAddTable(false);
  };

  const handleRemoveTable = (id: number) => {
    const table = tables.find((t) => t.id === id);
    setTables((prev) => prev.filter((t) => t.id !== id));
    if (table) {
      setUnassigned((prev) => [...prev, ...table.guests]);
    }
    startTransition(() => {
      removeSeatingTable(id);
    });
  };

  const handleAddGuestToTable = (tableId: number) => {
    const name = (guestInputs[tableId] || "").trim();
    if (!name) return;
    startTransition(async () => {
      await addGuest({ name, tableId });
      router.refresh();
    });
    setGuestInputs({ ...guestInputs, [tableId]: "" });
  };

  const handleRemoveGuest = (guestId: number, fromTable: boolean) => {
    if (fromTable) {
      setTables((prev) =>
        prev.map((t) => ({
          ...t,
          guests: t.guests.filter((g) => g.id !== guestId),
        }))
      );
    } else {
      setUnassigned((prev) => prev.filter((g) => g.id !== guestId));
    }
    startTransition(() => {
      removeGuest(guestId);
    });
  };

  const handleAddUnassigned = () => {
    const name = unassignedInput.trim();
    if (!name) return;
    startTransition(async () => {
      await addGuest({ name, tableId: null });
      router.refresh();
    });
    setUnassignedInput("");
  };

  const handleMoveToTable = (guestId: number, tableId: number) => {
    const guest = unassigned.find((g) => g.id === guestId);
    if (!guest) return;
    setUnassigned((prev) => prev.filter((g) => g.id !== guestId));
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, guests: [...t.guests, guest] } : t
      )
    );
    startTransition(() => {
      moveGuest(guestId, tableId);
    });
  };

  const handleUnassignGuest = (guestId: number, tableId: number) => {
    const table = tables.find((t) => t.id === tableId);
    const guest = table?.guests.find((g) => g.id === guestId);
    if (!guest) return;
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, guests: t.guests.filter((g) => g.id !== guestId) }
          : t
      )
    );
    setUnassigned((prev) => [...prev, guest]);
    startTransition(() => {
      moveGuest(guestId, null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="bg-white rounded-lg border border-stone-200 p-4 flex flex-wrap items-center gap-6">
        <div>
          <p className="text-xs text-stone-400">Tables</p>
          <p className="text-lg font-semibold text-stone-800">
            {tables.length}
          </p>
        </div>
        <div>
          <p className="text-xs text-stone-400">Seated</p>
          <p className="text-lg font-semibold text-stone-800">{totalSeated}</p>
        </div>
        <div>
          <p className="text-xs text-stone-400">Total Capacity</p>
          <p className="text-lg font-semibold text-stone-800">
            {totalCapacity}
          </p>
        </div>
        <div>
          <p className="text-xs text-stone-400">Unassigned</p>
          <p className="text-lg font-semibold text-amber-500">
            {unassigned.length}
          </p>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setShowAddTable(!showAddTable)}
            className="text-sm px-3 py-1.5 bg-stone-800 text-white rounded-md hover:bg-stone-900 transition-colors"
          >
            {showAddTable ? "Cancel" : "Add Table"}
          </button>
        </div>
      </div>

      {/* Add Table Form */}
      {showAddTable && (
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Table name (e.g. Head Table, Table 1)"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
              onKeyDown={(e) => e.key === "Enter" && handleAddTable()}
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500">Seats:</label>
              <input
                type="number"
                value={tableCapacity}
                onChange={(e) => setTableCapacity(e.target.value)}
                min={1}
                max={50}
                className="w-16 px-2 py-2 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
            </div>
            <button
              onClick={handleAddTable}
              disabled={isPending}
              className="px-4 py-2 bg-rose-500 text-white text-sm rounded-md hover:bg-rose-600 transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Tables Grid */}
      {tables.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => {
            const isFull = table.guests.length >= table.capacity;
            return (
              <div
                key={table.id}
                className="bg-white rounded-lg border border-stone-200 overflow-hidden"
              >
                <div className="px-4 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-heading text-sm text-stone-800">
                      {table.name}
                    </h4>
                    <p
                      className={`text-xs ${
                        isFull ? "text-amber-500" : "text-stone-400"
                      }`}
                    >
                      {table.guests.length} / {table.capacity} seats
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveTable(table.id)}
                    className="text-stone-300 hover:text-red-500 transition-colors"
                    title="Remove table"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                <div className="px-4 pt-2">
                  <div className="w-full bg-stone-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        isFull ? "bg-amber-500" : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(100, (table.guests.length / table.capacity) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  {table.guests.map((guest) => (
                    <div
                      key={guest.id}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-sm text-stone-700">
                        {guest.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            handleUnassignGuest(guest.id, table.id)
                          }
                          className="text-stone-300 hover:text-amber-500 transition-colors"
                          title="Unassign"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveGuest(guest.id, true)
                          }
                          className="text-stone-300 hover:text-red-500 transition-colors"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}

                  {!isFull && (
                    <div className="flex gap-1 pt-2">
                      <input
                        type="text"
                        placeholder="Add guest..."
                        value={guestInputs[table.id] || ""}
                        onChange={(e) =>
                          setGuestInputs({
                            ...guestInputs,
                            [table.id]: e.target.value,
                          })
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          handleAddGuestToTable(table.id)
                        }
                        className="flex-1 px-2 py-1 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-300"
                      />
                      <button
                        onClick={() => handleAddGuestToTable(table.id)}
                        className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-sm hover:bg-stone-200 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Unassigned Guests */}
      <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
        <div className="px-4 py-3 bg-stone-50 border-b border-stone-100">
          <h3 className="font-heading text-sm text-stone-700">
            Unassigned Guests ({unassigned.length})
          </h3>
        </div>
        <div className="p-4">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Add guest name..."
              value={unassignedInput}
              onChange={(e) => setUnassignedInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddUnassigned()}
              className="flex-1 px-3 py-2 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
            <button
              onClick={handleAddUnassigned}
              className="px-3 py-2 bg-stone-100 text-stone-600 rounded-md text-sm hover:bg-stone-200 transition-colors"
            >
              Add
            </button>
          </div>

          {unassigned.length === 0 ? (
            <p className="text-sm text-stone-400">
              No unassigned guests. Add guests here, then assign them to tables.
            </p>
          ) : (
            <div className="space-y-1">
              {unassigned.map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-stone-50"
                >
                  <span className="text-sm text-stone-700">{guest.name}</span>
                  <div className="flex items-center gap-2">
                    {tables.length > 0 && (
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value)
                            handleMoveToTable(
                              guest.id,
                              parseInt(e.target.value)
                            );
                        }}
                        className="text-xs px-2 py-1 border border-stone-200 rounded text-stone-500 focus:outline-none"
                      >
                        <option value="">Assign to...</option>
                        {tables
                          .filter((t) => t.guests.length < t.capacity)
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.guests.length}/{t.capacity})
                            </option>
                          ))}
                      </select>
                    )}
                    <button
                      onClick={() => handleRemoveGuest(guest.id, false)}
                      className="text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
