"use client";

import { useState } from "react";
import type { HouseholdData } from "@/lib/types";
import Sheet from "@/components/ui/Sheet";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Save, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";

interface Props {
  household: HouseholdData;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: HouseholdData) => void;
  onDeleted: (householdCode: string) => void;
}

interface FormState {
  headOfHousehold: string;
  phone: string;
  familyMembers: string[];
  plusOneAllowed: boolean;
  maxChildren: string;
  headAttending: string;
  familyAttending: string[];
  plusOneName: string;
  plusOneAttending: string;
  childrenNames: string[];
  childrenCount: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  dietaryNotes: string;
  texted: boolean;
}

function initForm(h: HouseholdData): FormState {
  return {
    headOfHousehold: h.headOfHousehold,
    phone: h.phone,
    familyMembers: [...h.familyMembers],
    plusOneAllowed: h.plusOneAllowed,
    maxChildren: h.maxChildren?.toString() ?? "",
    headAttending: h.headAttending,
    familyAttending: [...h.familyAttending],
    plusOneName: h.plusOneName,
    plusOneAttending: h.plusOneAttending,
    childrenNames: [...h.childrenNames],
    childrenCount: h.childrenCount.toString(),
    streetAddress: h.streetAddress,
    city: h.city,
    state: h.state,
    zip: h.zip,
    dietaryNotes: h.dietaryNotes,
    texted: h.texted,
  };
}

function AttendingSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <option value="">No response</option>
      <option value="attending">Attending</option>
      <option value="not_attending">Declined</option>
    </select>
  );
}

export default function GuestEditSheet({
  household,
  open,
  onClose,
  onSaved,
  onDeleted,
}: Props) {
  const [form, setForm] = useState<FormState>(() => initForm(household));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  // Reset form when a different household opens
  const [prevCode, setPrevCode] = useState(household.householdCode);
  if (household.householdCode !== prevCode) {
    setForm(initForm(household));
    setPrevCode(household.householdCode);
    setError("");
  }

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateFamilyMember = (index: number, value: string) => {
    const updated = [...form.familyMembers];
    updated[index] = value;
    updateField("familyMembers", updated);
  };

  const addFamilyMember = () => {
    updateField("familyMembers", [...form.familyMembers, ""]);
    updateField("familyAttending", [...form.familyAttending, ""]);
  };

  const removeFamilyMember = (index: number) => {
    updateField(
      "familyMembers",
      form.familyMembers.filter((_, i) => i !== index)
    );
    updateField(
      "familyAttending",
      form.familyAttending.filter((_, i) => i !== index)
    );
  };

  const updateFamilyAttending = (index: number, value: string) => {
    const updated = [...form.familyAttending];
    updated[index] = value;
    updateField("familyAttending", updated);
  };

  const updateChildName = (index: number, value: string) => {
    const updated = [...form.childrenNames];
    updated[index] = value;
    updateField("childrenNames", updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    const fields: Record<string, string> = {
      head_of_household: form.headOfHousehold,
      phone: form.phone,
      family_members: form.familyMembers.filter(Boolean).join(", "),
      plus_one_allowed: form.plusOneAllowed ? "yes" : "no",
      max_children: form.maxChildren,
      head_attending: form.headAttending,
      family_attending: form.familyAttending.join(", "),
      plus_one_name: form.plusOneName,
      plus_one_attending: form.plusOneAttending,
      children_names: form.childrenNames.filter(Boolean).join(", "),
      children_count: form.childrenCount,
      street_address: form.streetAddress,
      city: form.city,
      state: form.state,
      zip: form.zip,
      dietary_notes: form.dietaryNotes,
      texted: form.texted ? "yes" : "no",
    };

    try {
      const res = await fetch("/api/plan/guests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rowIndex: household.rowIndex,
          householdCode: household.householdCode,
          fields,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to save");
        return;
      }

      // Build updated household for optimistic update
      const updated: HouseholdData = {
        ...household,
        headOfHousehold: form.headOfHousehold,
        phone: form.phone,
        familyMembers: form.familyMembers.filter(Boolean),
        plusOneAllowed: form.plusOneAllowed,
        maxChildren: form.maxChildren ? parseInt(form.maxChildren, 10) : null,
        headAttending: form.headAttending as HouseholdData["headAttending"],
        familyAttending: form.familyAttending,
        plusOneName: form.plusOneName,
        plusOneAttending: form.plusOneAttending as HouseholdData["plusOneAttending"],
        childrenNames: form.childrenNames.filter(Boolean),
        childrenCount: parseInt(form.childrenCount, 10) || 0,
        streetAddress: form.streetAddress,
        city: form.city,
        state: form.state,
        zip: form.zip,
        dietaryNotes: form.dietaryNotes,
        texted: form.texted,
        updatedAt: new Date().toISOString(),
      };

      onSaved(updated);
      onClose();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} className="w-full max-w-lg overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pr-8">
          <div>
            <h2 className="text-lg font-semibold">Edit Household</h2>
            <p className="text-sm text-muted-foreground">{household.householdCode}</p>
          </div>
          <a
            href={`/rsvp?code=${household.householdCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View RSVP <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Contact */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Contact
          </h3>
          <div className="space-y-2">
            <label className="text-sm">Head of Household</label>
            <Input
              value={form.headOfHousehold}
              onChange={(e) => updateField("headOfHousehold", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Phone</label>
            <Input
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>
        </section>

        {/* RSVP - Head */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            RSVP Responses
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-sm">{form.headOfHousehold || "Head"}</span>
            <AttendingSelect
              value={form.headAttending}
              onChange={(v) => updateField("headAttending", v)}
            />
          </div>
        </section>

        {/* Family Members */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Family Members
            </h3>
            <Button variant="ghost" size="icon-xs" onClick={addFamilyMember}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {form.familyMembers.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No family members</p>
          )}
          {form.familyMembers.map((member, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={member}
                onChange={(e) => updateFamilyMember(i, e.target.value)}
                placeholder="Name"
                className="flex-1"
              />
              <AttendingSelect
                value={form.familyAttending[i] || ""}
                onChange={(v) => updateFamilyAttending(i, v)}
              />
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeFamilyMember(i)}
                className="text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </section>

        {/* Plus One */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Plus One
          </h3>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.plusOneAllowed}
              onChange={(e) => updateField("plusOneAllowed", e.target.checked)}
              className="rounded"
            />
            Plus one allowed
          </label>
          {form.plusOneAllowed && (
            <div className="space-y-2">
              <Input
                value={form.plusOneName}
                onChange={(e) => updateField("plusOneName", e.target.value)}
                placeholder="Plus one name"
              />
              <AttendingSelect
                value={form.plusOneAttending}
                onChange={(v) => updateField("plusOneAttending", v)}
              />
            </div>
          )}
        </section>

        {/* Children */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Children
          </h3>
          <div className="space-y-2">
            <label className="text-sm">Max children allowed</label>
            <Input
              type="number"
              min="0"
              value={form.maxChildren}
              onChange={(e) => updateField("maxChildren", e.target.value)}
              placeholder="Leave empty for N/A"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Children attending</label>
            <Input
              type="number"
              min="0"
              value={form.childrenCount}
              onChange={(e) => updateField("childrenCount", e.target.value)}
            />
          </div>
          {parseInt(form.childrenCount) > 0 && (
            <div className="space-y-2">
              <label className="text-sm">Children names</label>
              {Array.from({ length: parseInt(form.childrenCount) || 0 }).map(
                (_, i) => (
                  <Input
                    key={i}
                    value={form.childrenNames[i] || ""}
                    onChange={(e) => updateChildName(i, e.target.value)}
                    placeholder={`Child ${i + 1} name`}
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* Address */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Mailing Address
          </h3>
          <Input
            value={form.streetAddress}
            onChange={(e) => updateField("streetAddress", e.target.value)}
            placeholder="Street address"
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="City"
              className="col-span-1"
            />
            <Input
              value={form.state}
              onChange={(e) => updateField("state", e.target.value)}
              placeholder="State"
            />
            <Input
              value={form.zip}
              onChange={(e) => updateField("zip", e.target.value)}
              placeholder="ZIP"
            />
          </div>
        </section>

        {/* Dietary & Tracking */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Notes & Tracking
          </h3>
          <div className="space-y-2">
            <label className="text-sm">Dietary notes</label>
            <Input
              value={form.dietaryNotes}
              onChange={(e) => updateField("dietaryNotes", e.target.value)}
              placeholder="Any dietary restrictions"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.texted}
              onChange={(e) => updateField("texted", e.target.checked)}
              className="rounded"
            />
            Texted
          </label>
        </section>

        {/* Actions */}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} disabled={saving || deleting} className="flex-1">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={saving || deleting}>
            Cancel
          </Button>
        </div>

        {/* Delete */}
        <div className="border-t border-border/50 pt-4 pb-4">
          {!confirmDelete ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              disabled={saving || deleting}
              className="w-full"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Household
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-red-500">
                Delete {household.headOfHousehold}? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    setDeleting(true);
                    setError("");
                    try {
                      const res = await fetch("/api/plan/guests", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          rowIndex: household.rowIndex,
                          householdCode: household.householdCode,
                        }),
                      });
                      const data = await res.json();
                      if (!data.success) {
                        setError(data.error || "Failed to delete");
                        return;
                      }
                      onDeleted(household.householdCode);
                      onClose();
                    } catch {
                      setError("Something went wrong");
                    } finally {
                      setDeleting(false);
                      setConfirmDelete(false);
                    }
                  }}
                  disabled={deleting}
                  className="flex-1"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Yes, Delete"
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}
