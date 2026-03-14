"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  addBudgetItem,
  updateBudgetItem,
  removeBudgetItem,
  toggleBudgetItemPaid,
  deleteAttachment,
} from "@/actions/budget";
import { updateTotalBudget } from "@/actions/settings";
import { BUDGET_CATEGORIES } from "@/lib/planning-data";

interface Attachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  contentType: string | null;
}

interface BudgetItemData {
  id: number;
  category: string;
  name: string;
  estimated: number;
  actual: number;
  paid: boolean;
  notes: string;
  attachments: Attachment[];
}

interface Props {
  totalBudget: number;
  items: BudgetItemData[];
}

export default function BudgetSection({
  totalBudget: initialBudget,
  items: initialItems,
}: Props) {
  const [items, setItems] = useState(initialItems);
  const [totalBudget, setTotalBudget] = useState(initialBudget);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    category: BUDGET_CATEGORIES[0],
    name: "",
    estimated: "",
    actual: "",
  });
  const [isPending, startTransition] = useTransition();
  const fileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  const router = useRouter();

  const totalEstimated = items.reduce((s, i) => s + i.estimated, 0);
  const totalActual = items.reduce((s, i) => s + i.actual, 0);
  const totalPaid = items.filter((i) => i.paid).reduce((s, i) => s + i.actual, 0);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    });

  const grouped = BUDGET_CATEGORIES.map((cat) => ({
    category: cat,
    items: items.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  const resetForm = () => {
    setForm({ category: BUDGET_CATEGORIES[0], name: "", estimated: "", actual: "" });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const data = {
      category: form.category,
      name: form.name.trim(),
      estimated: parseFloat(form.estimated) || 0,
      actual: parseFloat(form.actual) || 0,
    };

    if (editingId) {
      setItems((prev) =>
        prev.map((i) => (i.id === editingId ? { ...i, ...data } : i))
      );
      startTransition(async () => {
        await updateBudgetItem(editingId, data);
      });
    } else {
      startTransition(async () => {
        await addBudgetItem(data);
        router.refresh();
      });
    }
    resetForm();
  };

  const handleEdit = (item: BudgetItemData) => {
    setForm({
      category: item.category,
      name: item.name,
      estimated: item.estimated.toString(),
      actual: item.actual.toString(),
    });
    setEditingId(item.id);
    setShowAddForm(true);
  };

  const handleRemove = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    startTransition(() => {
      removeBudgetItem(id);
    });
  };

  const handleTogglePaid = (id: number, paid: boolean) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, paid } : i))
    );
    startTransition(() => {
      toggleBudgetItemPaid(id, paid);
    });
  };

  const handleBudgetChange = (amount: number) => {
    setTotalBudget(amount);
    startTransition(() => {
      updateTotalBudget(amount);
    });
  };

  const handleUpload = async (budgetItemId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("budgetItemId", budgetItemId.toString());

    const res = await fetch("/api/plan/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const { attachment } = await res.json();
      setItems((prev) =>
        prev.map((i) =>
          i.id === budgetItemId
            ? { ...i, attachments: [...i.attachments, attachment] }
            : i
        )
      );
    }
  };

  const handleDeleteAttachment = (attId: number, fileUrl: string, budgetItemId: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === budgetItemId
          ? { ...i, attachments: i.attachments.filter((a) => a.id !== attId) }
          : i
      )
    );
    startTransition(() => {
      deleteAttachment(attId, fileUrl);
    });
  };

  return (
    <div className="space-y-6">
      {/* Budget Header */}
      <div className="bg-white rounded-lg border border-stone-200 p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-stone-500 mb-1">
              Total Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                $
              </span>
              <input
                type="number"
                value={totalBudget || ""}
                onChange={(e) =>
                  handleBudgetChange(parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                className="w-full pl-7 pr-3 py-2 border border-stone-200 rounded-md text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 flex-1 min-w-[300px]">
            <div>
              <p className="text-xs text-stone-400">Estimated</p>
              <p className="text-lg font-semibold text-stone-700">
                {fmt(totalEstimated)}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400">Actual</p>
              <p className="text-lg font-semibold text-stone-800">
                {fmt(totalActual)}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400">Paid</p>
              <p className="text-lg font-semibold text-green-600">
                {fmt(totalPaid)}
              </p>
            </div>
          </div>
        </div>

        {totalBudget > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-stone-400 mb-1">
              <span>
                {Math.round((totalActual / totalBudget) * 100)}% spent
              </span>
              <span>{fmt(totalBudget - totalActual)} remaining</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  totalActual > totalBudget ? "bg-red-600" : "bg-rose-400"
                }`}
                style={{
                  width: `${Math.min(100, (totalActual / totalBudget) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Form */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            if (showAddForm) resetForm();
            else setShowAddForm(true);
          }}
          className="text-sm px-3 py-1.5 bg-stone-800 text-white rounded-md hover:bg-stone-900 transition-colors"
        >
          {showAddForm ? "Cancel" : "Add Expense"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg border border-stone-200 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
            >
              {BUDGET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Item name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs text-stone-500 mb-1">
                Estimated
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  value={form.estimated}
                  onChange={(e) =>
                    setForm({ ...form, estimated: e.target.value })
                  }
                  placeholder="0"
                  className="w-full pl-7 pr-3 py-2 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs text-stone-500 mb-1">
                Actual
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  value={form.actual}
                  onChange={(e) =>
                    setForm({ ...form, actual: e.target.value })
                  }
                  placeholder="0"
                  className="w-full pl-7 pr-3 py-2 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="self-end px-4 py-2 bg-rose-500 text-white text-sm rounded-md hover:bg-rose-600 transition-colors disabled:opacity-50"
            >
              {editingId ? "Update" : "Add"}
            </button>
          </div>
        </div>
      )}

      {/* Expense Table by Category */}
      {grouped.length === 0 ? (
        <div className="bg-white rounded-lg border border-stone-200 p-8 text-center">
          <p className="text-stone-400 text-sm">
            No expenses yet. Add your first expense above.
          </p>
        </div>
      ) : (
        grouped.map(({ category, items: catItems }) => {
          const catEstimated = catItems.reduce((s, i) => s + i.estimated, 0);
          const catActual = catItems.reduce((s, i) => s + i.actual, 0);
          return (
            <div
              key={category}
              className="bg-white rounded-lg border border-stone-200 overflow-hidden"
            >
              <div className="px-4 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
                <span className="font-heading text-sm text-stone-700">
                  {category}
                </span>
                <span className="text-xs text-stone-400">
                  Est: {fmt(catEstimated)} | Actual: {fmt(catActual)}
                </span>
              </div>
              <div className="divide-y divide-stone-50">
                {catItems.map((item) => (
                  <div key={item.id} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.paid}
                        onChange={() =>
                          handleTogglePaid(item.id, !item.paid)
                        }
                        className="rounded border-stone-300"
                        title="Mark as paid"
                      />
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-sm ${
                            item.paid
                              ? "text-stone-400 line-through"
                              : "text-stone-700"
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm shrink-0">
                        <div className="text-right">
                          <p className="text-stone-400 text-xs">Est</p>
                          <p className="text-stone-600">
                            {fmt(item.estimated)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-stone-400 text-xs">Actual</p>
                          <p className="font-medium text-stone-800">
                            {fmt(item.actual)}
                          </p>
                        </div>
                        {/* Upload button */}
                        <button
                          onClick={() => {
                            const input = fileInputRefs.current.get(item.id);
                            input?.click();
                          }}
                          className="text-stone-300 hover:text-stone-500 transition-colors"
                          title="Attach file"
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
                              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                            />
                          </svg>
                        </button>
                        <input
                          type="file"
                          ref={(el) => {
                            if (el) fileInputRefs.current.set(item.id, el);
                          }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUpload(item.id, file);
                            e.target.value = "";
                          }}
                          className="hidden"
                        />
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-stone-300 hover:text-stone-500 transition-colors"
                          title="Edit"
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
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-stone-300 hover:text-red-500 transition-colors"
                          title="Delete"
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
                    </div>

                    {/* Attachments */}
                    {item.attachments.length > 0 && (
                      <div className="mt-2 ml-7 space-y-1">
                        {item.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <svg
                              className="w-3.5 h-3.5 text-stone-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                              />
                            </svg>
                            <a
                              href={att.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-rose-500 hover:underline truncate max-w-[200px]"
                            >
                              {att.fileName}
                            </a>
                            {att.fileSize && (
                              <span className="text-stone-400">
                                ({(att.fileSize / 1024).toFixed(0)} KB)
                              </span>
                            )}
                            <button
                              onClick={() =>
                                handleDeleteAttachment(
                                  att.id,
                                  att.fileUrl,
                                  item.id
                                )
                              }
                              className="text-stone-300 hover:text-red-500"
                            >
                              <svg
                                className="w-3 h-3"
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
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
