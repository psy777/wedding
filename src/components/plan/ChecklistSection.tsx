"use client";

import { useState, useTransition } from "react";
import {
  toggleChecklistItem,
  updateChecklistNotes,
  addCustomChecklistItem,
  removeChecklistItem,
} from "@/actions/checklist";
import {
  CHECKLIST_CATEGORIES,
  getDueDate,
  formatDate,
} from "@/lib/planning-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight,
  Plus,
  Pencil,
  X,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: number;
  title: string;
  category: string;
  monthsBefore: number;
  isCustom: boolean;
  completed: boolean;
  notes: string;
}

interface Props {
  items: ChecklistItem[];
  weddingDate: string;
}

export default function ChecklistSection({
  items: initialItems,
  weddingDate,
}: Props) {
  const [items, setItems] = useState(initialItems);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(CHECKLIST_CATEGORIES)
  );
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState(CHECKLIST_CATEGORIES[0]);
  const [newMonths, setNewMonths] = useState("12");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const now = new Date();

  // Upcoming deadlines (overdue + soonest incomplete)
  const upcomingItems = items
    .filter((i) => !i.completed)
    .map((i) => ({ ...i, dueDate: getDueDate(weddingDate, i.monthsBefore) }))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 8);

  const toggleCategory = (cat: string) => {
    const next = new Set(expandedCategories);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setExpandedCategories(next);
  };

  const handleToggle = (id: number, completed: boolean) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, completed } : i))
    );
    startTransition(async () => {
      try {
        await toggleChecklistItem(id, completed);
      } catch {
        setItems((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, completed: !completed } : i
          )
        );
      }
    });
  };

  const handleNotesChange = (id: number, notes: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, notes } : i))
    );
  };

  const handleNotesSave = (id: number, notes: string) => {
    startTransition(() => {
      updateChecklistNotes(id, notes);
    });
  };

  const handleAddCustom = () => {
    if (!newTitle.trim()) return;
    startTransition(async () => {
      await addCustomChecklistItem({
        title: newTitle.trim(),
        category: newCategory,
        monthsBefore: parseFloat(newMonths) || 12,
      });
      setNewTitle("");
      setNewMonths("12");
      setDialogOpen(false);
    });
  };

  const handleRemove = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    startTransition(() => {
      removeChecklistItem(id);
    });
  };

  const allCategories = [
    ...new Set([
      ...CHECKLIST_CATEGORIES,
      ...items.map((i) => i.category),
    ]),
  ];
  const grouped = allCategories
    .map((cat) => {
      const catItems = items.filter((i) => i.category === cat);
      const completed = catItems.filter((i) => i.completed).length;
      return {
        category: cat,
        items: catItems,
        completed,
        total: catItems.length,
      };
    })
    .filter((g) => g.total > 0);

  return (
    <div className="space-y-4">
      {/* Upcoming Deadlines */}
      {upcomingItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg font-heading">
                Upcoming Deadlines
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {upcomingItems.map((item, idx) => {
                const overdue = item.dueDate < now;
                const soon =
                  !overdue &&
                  item.dueDate.getTime() - now.getTime() <
                    14 * 24 * 60 * 60 * 1000;
                return (
                  <div key={item.id}>
                    {idx > 0 && <Separator />}
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-sm truncate mr-3">
                        {item.title}
                      </span>
                      <Badge
                        variant={
                          overdue
                            ? "destructive"
                            : soon
                              ? "default"
                              : "secondary"
                        }
                        className="shrink-0"
                      >
                        {formatDate(item.dueDate)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <Checkbox
            checked={hideCompleted}
            onCheckedChange={(checked) =>
              setHideCompleted(checked === true)
            }
          />
          Hide completed tasks
        </label>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="h-4 w-4 mr-1" />
            Add Custom Task
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="task-title">Task Title</Label>
                <Input
                  id="task-title"
                  placeholder="e.g. Book venue tour"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newCategory} onValueChange={(v) => v && setNewCategory(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHECKLIST_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="months-before">Months Before Wedding</Label>
                <Input
                  id="months-before"
                  type="number"
                  value={newMonths}
                  onChange={(e) => setNewMonths(e.target.value)}
                  min={0}
                  max={24}
                  step={0.25}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button onClick={handleAddCustom} disabled={isPending}>
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Groups */}
      {grouped.map(({ category, items: catItems, completed, total }) => {
        const expanded = expandedCategories.has(category);
        const filteredItems = hideCompleted
          ? catItems.filter((i) => !i.completed)
          : catItems;
        const progressPct = total > 0 ? (completed / total) * 100 : 0;

        return (
          <Card key={category} className="overflow-hidden">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ChevronRight
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    expanded && "rotate-90"
                  )}
                />
                <span className="font-heading text-foreground">
                  {category}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {completed}/{total}
                </span>
                <Progress value={progressPct} className="w-24 h-1.5" />
              </div>
            </button>

            {expanded && filteredItems.length > 0 && (
              <CardContent className="pt-0 pb-2 border-t">
                <ul className="divide-y divide-border/50">
                  {filteredItems.map((item) => {
                    const dueDate = getDueDate(weddingDate, item.monthsBefore);
                    const overdue = !item.completed && dueDate < now;
                    const soon =
                      !item.completed &&
                      !overdue &&
                      dueDate.getTime() - now.getTime() <
                        14 * 24 * 60 * 60 * 1000;

                    return (
                      <li key={item.id} className="py-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={() =>
                              handleToggle(item.id, !item.completed)
                            }
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={cn(
                                  "text-sm",
                                  item.completed &&
                                    "line-through text-muted-foreground"
                                )}
                              >
                                {item.title}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Badge
                                  variant={
                                    item.completed
                                      ? "secondary"
                                      : overdue
                                        ? "destructive"
                                        : soon
                                          ? "default"
                                          : "outline"
                                  }
                                >
                                  {item.completed
                                    ? "Done"
                                    : formatDate(dueDate)}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 relative"
                                  onClick={() =>
                                    setEditingNotes(
                                      editingNotes === item.id
                                        ? null
                                        : item.id
                                    )
                                  }
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  {item.notes && editingNotes !== item.id && (
                                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
                                  )}
                                </Button>
                                {item.isCustom && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleRemove(item.id)}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            {editingNotes === item.id && (
                              <Textarea
                                value={item.notes}
                                onChange={(e) =>
                                  handleNotesChange(item.id, e.target.value)
                                }
                                onBlur={() =>
                                  handleNotesSave(item.id, item.notes)
                                }
                                placeholder="Add notes..."
                                rows={2}
                                className="mt-2 resize-none"
                              />
                            )}
                            {editingNotes !== item.id && item.notes && (
                              <p className="mt-1 text-xs text-muted-foreground italic">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            )}
            {expanded && filteredItems.length === 0 && (
              <CardContent className="pt-0 border-t">
                <p className="text-sm text-muted-foreground py-3">
                  {hideCompleted
                    ? "All tasks in this category are completed!"
                    : "No tasks"}
                </p>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
