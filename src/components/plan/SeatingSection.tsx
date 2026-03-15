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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  X,
  LogOut,
  Users,
  Armchair,
} from "lucide-react";

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
  const [dialogOpen, setDialogOpen] = useState(false);
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
    setDialogOpen(false);
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

  const handleMoveToTable = (guestId: number, tableId: string) => {
    const tid = parseInt(tableId);
    const guest = unassigned.find((g) => g.id === guestId);
    if (!guest) return;
    setUnassigned((prev) => prev.filter((g) => g.id !== guestId));
    setTables((prev) =>
      prev.map((t) =>
        t.id === tid ? { ...t, guests: [...t.guests, guest] } : t
      )
    );
    startTransition(() => {
      moveGuest(guestId, tid);
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
      <Card>
        <CardContent className="py-4 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Armchair className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Tables</p>
              <p className="text-lg font-semibold">{tables.length}</p>
            </div>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div>
            <p className="text-xs text-muted-foreground">Seated</p>
            <p className="text-lg font-semibold">{totalSeated}</p>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div>
            <p className="text-xs text-muted-foreground">Capacity</p>
            <p className="text-lg font-semibold">{totalCapacity}</p>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div>
            <p className="text-xs text-muted-foreground">Unassigned</p>
            <Badge variant={unassigned.length > 0 ? "default" : "secondary"}>
              {unassigned.length}
            </Badge>
          </div>
          <div className="ml-auto">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger render={<Button size="sm" />}>
                <Plus className="h-4 w-4 mr-1" />
                Add Table
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Table</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="table-name">Table Name</Label>
                    <Input
                      id="table-name"
                      placeholder="e.g. Head Table, Table 1"
                      value={tableName}
                      onChange={(e) => setTableName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddTable()
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="table-capacity">Seats</Label>
                    <Input
                      id="table-capacity"
                      type="number"
                      value={tableCapacity}
                      onChange={(e) => setTableCapacity(e.target.value)}
                      min={1}
                      max={50}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    Cancel
                  </DialogClose>
                  <Button onClick={handleAddTable} disabled={isPending}>
                    Add Table
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Tables Grid */}
      {tables.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => {
            const isFull = table.guests.length >= table.capacity;
            const fillPct = (table.guests.length / table.capacity) * 100;
            return (
              <Card key={table.id}>
                <CardHeader className="py-3 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-heading">
                        {table.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {table.guests.length} / {table.capacity} seats
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveTable(table.id)}
                      title="Remove table"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Progress
                    value={fillPct}
                    className="h-1.5 mt-2"
                  />
                </CardHeader>

                <CardContent className="pt-3 space-y-1">
                  {table.guests.map((guest) => (
                    <div
                      key={guest.id}
                      className="flex items-center justify-between py-1 group"
                    >
                      <span className="text-sm">{guest.name}</span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            handleUnassignGuest(guest.id, table.id)
                          }
                          title="Unassign"
                        >
                          <LogOut className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            handleRemoveGuest(guest.id, true)
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {!isFull && (
                    <div className="flex gap-1 pt-2">
                      <Input
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
                        className="h-8 text-sm"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleAddGuestToTable(table.id)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Unassigned Guests */}
      <Card>
        <CardHeader className="py-3 bg-muted/50">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-heading">
              Unassigned Guests ({unassigned.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Add guest name..."
              value={unassignedInput}
              onChange={(e) => setUnassignedInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleAddUnassigned()
              }
            />
            <Button
              variant="secondary"
              onClick={handleAddUnassigned}
            >
              Add
            </Button>
          </div>

          {unassigned.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No unassigned guests. Add guests here, then assign them to
              tables.
            </p>
          ) : (
            <div className="space-y-1">
              {unassigned.map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 group"
                >
                  <span className="text-sm">{guest.name}</span>
                  <div className="flex items-center gap-2">
                    {tables.length > 0 && (
                      <Select
                        value=""
                        onValueChange={(v) =>
                          v && handleMoveToTable(guest.id, v)
                        }
                      >
                        <SelectTrigger className="h-7 text-xs w-[140px]">
                          <SelectValue placeholder="Assign to..." />
                        </SelectTrigger>
                        <SelectContent>
                          {tables
                            .filter(
                              (t) => t.guests.length < t.capacity
                            )
                            .map((t) => (
                              <SelectItem
                                key={t.id}
                                value={t.id.toString()}
                              >
                                {t.name} ({t.guests.length}/
                                {t.capacity})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() =>
                        handleRemoveGuest(guest.id, false)
                      }
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
