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

export default function ChecklistSection({ items: initialItems, weddingDate }: Props) {
  const [items, setItems] = useState(initialItems);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(CHECKLIST_CATEGORIES)
  );
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState(CHECKLIST_CATEGORIES[0]);
  const [newMonths, setNewMonths] = useState(12);
  const [isPending, startTransition] = useTransition();

  const now = new Date();

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
          prev.map((i) => (i.id === id ? { ...i, completed: !completed } : i))
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
        monthsBefore: newMonths,
      });
      setNewTitle("");
      setShowAddForm(false);
    });
  };

  const handleRemove = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    startTransition(() => {
      removeChecklistItem(id);
    });
  };

  // Group items by category
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
      return { category: cat, items: catItems, completed, total: catItems.length };
    })
    .filter((g) => g.total > 0);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={(e) => setHideCompleted(e.target.checked)}
            className="rounded border-stone-300"
          />
          Hide completed tasks
        </label>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-sm px-3 py-1.5 bg-stone-800 text-white rounded-md hover:bg-stone-900 transition-colors"
        >
          {showAddForm ? "Cancel" : "Add Custom Task"}
        </button>
      </div>

      {/* Add Custom Task Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-stone-200 p-4 space-y-3">
          <input
            type="text"
            placeholder="Task title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
            onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
          />
          <div className="flex flex-wrap gap-3">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 min-w-[180px] px-3 py-2 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
            >
              {CHECKLIST_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500">Months before:</label>
              <input
                type="number"
                value={newMonths}
                onChange={(e) => setNewMonths(Number(e.target.value))}
                min={0}
                max={24}
                step={0.25}
                className="w-20 px-2 py-2 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
            </div>
            <button
              onClick={handleAddCustom}
              disabled={isPending}
              className="px-4 py-2 bg-rose-500 text-white text-sm rounded-md hover:bg-rose-600 transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Category Groups */}
      {grouped.map(({ category, items: catItems, completed, total }) => {
        const expanded = expandedCategories.has(category);
        const filteredItems = hideCompleted
          ? catItems.filter((i) => !i.completed)
          : catItems;

        return (
          <div
            key={category}
            className="bg-white rounded-lg border border-stone-200 overflow-hidden"
          >
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg
                  className={`w-4 h-4 text-stone-400 transition-transform ${
                    expanded ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span className="font-heading text-stone-800">{category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-400">
                  {completed}/{total}
                </span>
                <div className="w-24 bg-stone-100 rounded-full h-1.5">
                  <div
                    className="bg-green-600 h-1.5 rounded-full transition-all"
                    style={{
                      width: `${total > 0 ? (completed / total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </button>

            {expanded && filteredItems.length > 0 && (
              <ul className="border-t border-stone-100 divide-y divide-stone-50">
                {filteredItems.map((item) => {
                  const dueDate = getDueDate(weddingDate, item.monthsBefore);
                  const overdue = !item.completed && dueDate < now;
                  const soon =
                    !item.completed &&
                    !overdue &&
                    dueDate.getTime() - now.getTime() <
                      14 * 24 * 60 * 60 * 1000;

                  return (
                    <li key={item.id} className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() =>
                            handleToggle(item.id, !item.completed)
                          }
                          className="mt-0.5 rounded border-stone-300"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-sm ${
                                item.completed
                                  ? "line-through text-stone-400"
                                  : "text-stone-700"
                              }`}
                            >
                              {item.title}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  item.completed
                                    ? "bg-green-50 text-green-600"
                                    : overdue
                                      ? "bg-red-50 text-red-600"
                                      : soon
                                        ? "bg-amber-50 text-amber-600"
                                        : "bg-stone-50 text-stone-500"
                                }`}
                              >
                                {item.completed
                                  ? "Done"
                                  : formatDate(dueDate)}
                              </span>
                              <button
                                onClick={() =>
                                  setEditingNotes(
                                    editingNotes === item.id ? null : item.id
                                  )
                                }
                                className="text-stone-300 hover:text-stone-500 transition-colors"
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
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              {item.isCustom && (
                                <button
                                  onClick={() => handleRemove(item.id)}
                                  className="text-stone-300 hover:text-red-500 transition-colors"
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
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                          {editingNotes === item.id && (
                            <textarea
                              value={item.notes}
                              onChange={(e) =>
                                handleNotesChange(item.id, e.target.value)
                              }
                              onBlur={() =>
                                handleNotesSave(item.id, item.notes)
                              }
                              placeholder="Add notes..."
                              rows={2}
                              className="mt-2 w-full px-3 py-2 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
                            />
                          )}
                          {editingNotes !== item.id && item.notes && (
                            <p className="mt-1 text-xs text-stone-400 italic">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {expanded && filteredItems.length === 0 && (
              <p className="px-4 py-3 text-sm text-stone-400 border-t border-stone-100">
                {hideCompleted
                  ? "All tasks in this category are completed!"
                  : "No tasks"}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
