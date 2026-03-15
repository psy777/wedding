"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  addBudgetCategory,
  updateBudgetCategory,
  removeBudgetCategory,
  addBudgetItem,
  updateBudgetItem,
  removeBudgetItem,
  toggleBudgetItemPaid,
  deleteAttachment,
} from "@/actions/budget";
import { updateTotalBudget } from "@/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  Paperclip,
  X,
  Upload,
  FileText,
  FileImage,
  File as FileIcon,
  Loader2,
  ChevronRight,
  FolderPlus,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────

interface Attachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  contentType: string | null;
}

interface BudgetItemData {
  id: number;
  categoryId: number;
  name: string;
  estimated: number;
  actual: number;
  paid: boolean;
  notes: string;
  attachments: Attachment[];
}

interface BudgetCategoryData {
  id: number;
  name: string;
  budgetAmount: number;
  sortOrder: number;
  items: BudgetItemData[];
}

interface Props {
  totalBudget: number;
  categories: BudgetCategoryData[];
}

// ── Component ─────────────────────────────────────────────────────

export default function BudgetSection({
  totalBudget: initialBudget,
  categories: initialCategories,
}: Props) {
  const [categories, setCategories] = useState(initialCategories);
  const [totalBudget, setTotalBudget] = useState(initialBudget);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Expense dialog state
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    name: "",
    estimated: "",
    actual: "",
  });

  // Section dialog state
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [sectionForm, setSectionForm] = useState({
    name: "",
    budgetAmount: "",
  });

  // Attachment state
  const fileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  const [uploading, setUploading] = useState<Record<number, number>>({});
  const [dragOver, setDragOver] = useState<number | null>(null);

  // ── Computed Values ───────────────────────────────────────────────

  const totalEstimated = categories.reduce(
    (s, c) => s + c.items.reduce((s2, i) => s2 + i.estimated, 0),
    0
  );
  const totalActual = categories.reduce(
    (s, c) => s + c.items.reduce((s2, i) => s2 + i.actual, 0),
    0
  );
  const totalPaid = categories.reduce(
    (s, c) =>
      s + c.items.filter((i) => i.paid).reduce((s2, i) => s2 + i.actual, 0),
    0
  );
  const totalAllocated = categories.reduce(
    (s, c) => s + c.budgetAmount,
    0
  );

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    });

  // ── Budget Handlers ───────────────────────────────────────────────

  const handleBudgetChange = (amount: number) => {
    setTotalBudget(amount);
    startTransition(() => {
      updateTotalBudget(amount);
    });
  };

  // ── Section Handlers ──────────────────────────────────────────────

  const toggleCollapse = (id: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openAddSection = () => {
    setSectionForm({ name: "", budgetAmount: "" });
    setEditingSectionId(null);
    setSectionDialogOpen(true);
  };

  const openEditSection = (cat: BudgetCategoryData) => {
    setSectionForm({
      name: cat.name,
      budgetAmount: cat.budgetAmount > 0 ? cat.budgetAmount.toString() : "",
    });
    setEditingSectionId(cat.id);
    setSectionDialogOpen(true);
  };

  const handleSaveSection = () => {
    const name = sectionForm.name.trim();
    if (!name) return;
    const budgetAmount = parseFloat(sectionForm.budgetAmount) || 0;

    if (editingSectionId) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingSectionId ? { ...c, name, budgetAmount } : c
        )
      );
      startTransition(async () => {
        await updateBudgetCategory(editingSectionId, { name, budgetAmount });
      });
    } else {
      startTransition(async () => {
        const cat = await addBudgetCategory({ name, budgetAmount });
        router.refresh();
      });
    }
    setSectionDialogOpen(false);
    setEditingSectionId(null);
  };

  const handleRemoveSection = (id: number) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    startTransition(() => {
      removeBudgetCategory(id);
    });
  };

  // ── Expense Handlers ──────────────────────────────────────────────

  const openAddExpense = (categoryId: number) => {
    setExpenseForm({ name: "", estimated: "", actual: "" });
    setEditingExpenseId(null);
    setActiveCategoryId(categoryId);
    setExpenseDialogOpen(true);
  };

  const openEditExpense = (item: BudgetItemData) => {
    setExpenseForm({
      name: item.name,
      estimated: item.estimated > 0 ? item.estimated.toString() : "",
      actual: item.actual > 0 ? item.actual.toString() : "",
    });
    setEditingExpenseId(item.id);
    setActiveCategoryId(item.categoryId);
    setExpenseDialogOpen(true);
  };

  const handleSaveExpense = () => {
    if (!expenseForm.name.trim() || !activeCategoryId) return;
    const data = {
      name: expenseForm.name.trim(),
      estimated: parseFloat(expenseForm.estimated) || 0,
      actual: parseFloat(expenseForm.actual) || 0,
    };

    if (editingExpenseId) {
      setCategories((prev) =>
        prev.map((c) => ({
          ...c,
          items: c.items.map((i) =>
            i.id === editingExpenseId ? { ...i, ...data } : i
          ),
        }))
      );
      startTransition(async () => {
        await updateBudgetItem(editingExpenseId, data);
      });
    } else {
      startTransition(async () => {
        await addBudgetItem({ categoryId: activeCategoryId!, ...data });
        router.refresh();
      });
    }
    setExpenseDialogOpen(false);
    setEditingExpenseId(null);
    setActiveCategoryId(null);
  };

  const handleRemoveExpense = (id: number) => {
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        items: c.items.filter((i) => i.id !== id),
      }))
    );
    startTransition(() => {
      removeBudgetItem(id);
    });
  };

  const handleTogglePaid = (id: number, paid: boolean) => {
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        items: c.items.map((i) => (i.id === id ? { ...i, paid } : i)),
      }))
    );
    startTransition(() => {
      toggleBudgetItemPaid(id, paid);
    });
  };

  // ── Attachment Handlers ───────────────────────────────────────────

  const handleUpload = async (budgetItemId: number, file: File) => {
    setUploading((prev) => ({ ...prev, [budgetItemId]: 0 }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("budgetItemId", budgetItemId.toString());

    try {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploading((prev) => ({ ...prev, [budgetItemId]: pct }));
        }
      });

      const result = await new Promise<{ attachment: Attachment }>(
        (resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error("Upload failed"));
            }
          };
          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.open("POST", "/api/plan/upload");
          xhr.send(formData);
        }
      );

      setCategories((prev) =>
        prev.map((c) => ({
          ...c,
          items: c.items.map((i) =>
            i.id === budgetItemId
              ? { ...i, attachments: [...i.attachments, result.attachment] }
              : i
          ),
        }))
      );
    } catch {
      // silently fail
    } finally {
      setUploading((prev) => {
        const next = { ...prev };
        delete next[budgetItemId];
        return next;
      });
    }
  };

  const handleDrop = useCallback(
    (budgetItemId: number, e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(null);
      const file = e.dataTransfer.files?.[0];
      if (file) handleUpload(budgetItemId, file);
    },
    []
  );

  const getFileIcon = (contentType: string | null) => {
    if (!contentType) return FileIcon;
    if (contentType.startsWith("image/")) return FileImage;
    if (contentType.includes("pdf")) return FileText;
    return FileIcon;
  };

  const handleDeleteAttachment = (
    attId: number,
    fileUrl: string,
    budgetItemId: number
  ) => {
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        items: c.items.map((i) =>
          i.id === budgetItemId
            ? {
                ...i,
                attachments: i.attachments.filter((a) => a.id !== attId),
              }
            : i
        ),
      }))
    );
    startTransition(() => {
      deleteAttachment(attId, fileUrl);
    });
  };

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Budget Summary */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-end gap-6">
            <div className="space-y-1.5 min-w-[200px]">
              <Label htmlFor="total-budget">Total Budget</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="total-budget"
                  type="number"
                  value={totalBudget || ""}
                  onChange={(e) =>
                    handleBudgetChange(parseFloat(e.target.value) || 0)
                  }
                  placeholder="0"
                  className="pl-7 text-lg font-semibold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1 min-w-[300px]">
              <div>
                <p className="text-xs text-muted-foreground">Allocated</p>
                <p className="text-lg font-semibold">{fmt(totalAllocated)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estimated</p>
                <p className="text-lg font-semibold">{fmt(totalEstimated)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Actual</p>
                <p className="text-lg font-semibold">{fmt(totalActual)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-lg font-semibold text-chart-2">
                  {fmt(totalPaid)}
                </p>
              </div>
            </div>
          </div>

          {totalBudget > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>
                  {Math.round((totalActual / totalBudget) * 100)}% spent
                </span>
                <span>{fmt(totalBudget - totalActual)} remaining</span>
              </div>
              <Progress
                value={Math.min(100, (totalActual / totalBudget) * 100)}
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={openAddSection}>
          <FolderPlus className="h-4 w-4 mr-1" />
          Add Section
        </Button>
      </div>

      {/* Category Sections */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground text-sm">
              No budget sections yet. Add your first section above.
            </p>
          </CardContent>
        </Card>
      ) : (
        categories.map((cat) => {
          const isCollapsed = collapsed.has(cat.id);
          const catEstimated = cat.items.reduce(
            (s, i) => s + i.estimated,
            0
          );
          const catActual = cat.items.reduce((s, i) => s + i.actual, 0);
          const catBasis = cat.budgetAmount > 0 ? cat.budgetAmount : catEstimated;

          return (
            <Card key={cat.id} className="overflow-hidden">
              {/* Section Header */}
              <CardHeader
                className="py-3 bg-muted/50 cursor-pointer select-none"
                onClick={() => toggleCollapse(cat.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                        !isCollapsed ? "rotate-90" : ""
                      }`}
                    />
                    <CardTitle className="text-sm font-heading truncate">
                      {cat.name}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      ({cat.items.length} item{cat.items.length !== 1 ? "s" : ""})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs text-muted-foreground">
                        {fmt(catActual)}
                        {catBasis > 0 && ` / ${fmt(catBasis)}`}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEditSection(cat)}
                        title="Edit section"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveSection(cat.id)}
                        title="Delete section"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Per-section progress bar */}
                {catBasis > 0 && (
                  <Progress
                    value={Math.min(100, (catActual / catBasis) * 100)}
                    className="h-1.5 mt-2"
                  />
                )}
              </CardHeader>

              {/* Section Content */}
              {!isCollapsed && (
                <CardContent className="p-0">
                  {cat.items.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No expenses in this section yet.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">Paid</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">
                            Estimated
                          </TableHead>
                          <TableHead className="text-right">Actual</TableHead>
                          <TableHead className="w-24 text-right">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cat.items.map((item) => (
                          <TableRow key={item.id} className="group">
                            <TableCell>
                              <Checkbox
                                checked={item.paid}
                                onCheckedChange={() =>
                                  handleTogglePaid(item.id, !item.paid)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <span
                                className={
                                  item.paid
                                    ? "text-muted-foreground line-through"
                                    : ""
                                }
                              >
                                {item.name}
                              </span>
                              {/* Attachments */}
                              {item.attachments.length > 0 && (
                                <div className="mt-1.5 space-y-1">
                                  {item.attachments.map((att) => {
                                    const Icon = getFileIcon(att.contentType);
                                    const isImage =
                                      att.contentType?.startsWith("image/");
                                    return (
                                      <div
                                        key={att.id}
                                        className="flex items-center gap-2 text-xs"
                                      >
                                        {isImage ? (
                                          <img
                                            src={att.fileUrl}
                                            alt={att.fileName}
                                            className="h-6 w-6 rounded object-cover shrink-0"
                                          />
                                        ) : (
                                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                        )}
                                        <a
                                          href={att.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-primary hover:underline truncate max-w-[200px]"
                                        >
                                          {att.fileName}
                                        </a>
                                        {att.fileSize && (
                                          <span className="text-muted-foreground">
                                            (
                                            {(att.fileSize / 1024).toFixed(0)}{" "}
                                            KB)
                                          </span>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-4 w-4 text-muted-foreground hover:text-destructive"
                                          onClick={() =>
                                            handleDeleteAttachment(
                                              att.id,
                                              att.fileUrl,
                                              item.id
                                            )
                                          }
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              {/* Upload progress */}
                              {uploading[item.id] !== undefined && (
                                <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary transition-all duration-200 rounded-full"
                                      style={{
                                        width: `${uploading[item.id]}%`,
                                      }}
                                    />
                                  </div>
                                  <span>{uploading[item.id]}%</span>
                                </div>
                              )}
                              {/* Drop zone */}
                              <div
                                className={`mt-1.5 border border-dashed rounded-md p-2 text-center text-xs text-muted-foreground transition-colors cursor-pointer ${
                                  dragOver === item.id
                                    ? "border-primary bg-primary/5"
                                    : "border-border/50 hover:border-border"
                                } ${
                                  item.attachments.length === 0 &&
                                  uploading[item.id] === undefined
                                    ? ""
                                    : "hidden group-hover:block"
                                }`}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  setDragOver(item.id);
                                }}
                                onDragLeave={() => setDragOver(null)}
                                onDrop={(e) => handleDrop(item.id, e)}
                                onClick={() => {
                                  const input = fileInputRefs.current.get(
                                    item.id
                                  );
                                  input?.click();
                                }}
                              >
                                <Upload className="h-3.5 w-3.5 inline mr-1" />
                                Drop file or click to attach
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {fmt(item.estimated)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {fmt(item.actual)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    const input = fileInputRefs.current.get(
                                      item.id
                                    );
                                    input?.click();
                                  }}
                                  title="Attach file"
                                >
                                  <Paperclip className="h-3.5 w-3.5" />
                                </Button>
                                <input
                                  type="file"
                                  ref={(el) => {
                                    if (el)
                                      fileInputRefs.current.set(item.id, el);
                                  }}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUpload(item.id, file);
                                    e.target.value = "";
                                  }}
                                  className="hidden"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => openEditExpense(item)}
                                  title="Edit"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleRemoveExpense(item.id)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {/* Add expense button within section */}
                  <div className="p-3 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => openAddExpense(cat.id)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add expense
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })
      )}

      {/* Section Dialog */}
      <Dialog
        open={sectionDialogOpen}
        onOpenChange={(open) => {
          setSectionDialogOpen(open);
          if (!open) {
            setEditingSectionId(null);
            setSectionForm({ name: "", budgetAmount: "" });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSectionId ? "Edit Section" : "Add Section"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="section-name">Section Name</Label>
              <Input
                id="section-name"
                placeholder="e.g. Venue & Rentals"
                value={sectionForm.name}
                onChange={(e) =>
                  setSectionForm({ ...sectionForm, name: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && handleSaveSection()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section-budget">
                Budget Amount{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </span>
                <Input
                  id="section-budget"
                  type="number"
                  value={sectionForm.budgetAmount}
                  onChange={(e) =>
                    setSectionForm({
                      ...sectionForm,
                      budgetAmount: e.target.value,
                    })
                  }
                  placeholder="0"
                  className="pl-7"
                  onKeyDown={(e) => e.key === "Enter" && handleSaveSection()}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button onClick={handleSaveSection} disabled={isPending}>
              {editingSectionId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog
        open={expenseDialogOpen}
        onOpenChange={(open) => {
          setExpenseDialogOpen(open);
          if (!open) {
            setEditingExpenseId(null);
            setActiveCategoryId(null);
            setExpenseForm({ name: "", estimated: "", actual: "" });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingExpenseId ? "Edit Expense" : "Add Expense"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="expense-name">Item Name</Label>
              <Input
                id="expense-name"
                placeholder="e.g. Venue deposit"
                value={expenseForm.name}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, name: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && handleSaveExpense()}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expense-estimated">Estimated</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    id="expense-estimated"
                    type="number"
                    value={expenseForm.estimated}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        estimated: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-actual">Actual</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    id="expense-actual"
                    type="number"
                    value={expenseForm.actual}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        actual: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="pl-7"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button onClick={handleSaveExpense} disabled={isPending}>
              {editingExpenseId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
