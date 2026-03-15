"use client";

import { useState, useTransition, useEffect } from "react";
import { updateSettings, addHotel, updateHotel, removeHotel } from "@/actions/settings";
import {
  setPin,
  removePin,
  getPasskeyRegistrationOptions,
  completePasskeyRegistration,
  removePasskey,
} from "@/actions/plan-auth";
import { startRegistration, browserSupportsWebAuthn } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  Shield,
  Fingerprint,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

interface Hotel {
  id: number;
  name: string;
  address: string;
  phone: string;
  notes: string;
  bookingUrl: string;
}

interface Settings {
  partner1Name: string;
  partner2Name: string;
  weddingDate: string;
  ceremonyTime: string;
  receptionTime: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venueState: string;
  venueZip: string;
  venueMapUrl: string;
  totalBudget: number;
  rsvpDeadline: string;
  dressCode: string;
  directions: string;
  parking: string;
}

interface PasskeyInfo {
  id: string;
  createdAt: string;
}

interface Props {
  settings: Settings;
  hotels: Hotel[];
  hasPin: boolean;
  passkeys: PasskeyInfo[];
}

export default function SettingsForm({
  settings: initial,
  hotels: initialHotels,
  hasPin: initialHasPin,
  passkeys: initialPasskeys,
}: Props) {
  const [form, setForm] = useState<Settings>(initial);
  const [hotelList, setHotelList] = useState<Hotel[]>(initialHotels);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  // Security state
  const [hasPin, setHasPin] = useState(initialHasPin);
  const [passkeys, setPasskeys] = useState<PasskeyInfo[]>(initialPasskeys);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState("");
  const [canWebAuthn, setCanWebAuthn] = useState(false);

  useEffect(() => {
    setCanWebAuthn(browserSupportsWebAuthn());
  }, []);

  const set = (key: keyof Settings, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setSaved(false);
    startTransition(async () => {
      await updateSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const handleAddHotel = () => {
    startTransition(async () => {
      const result = await addHotel({ name: "New Hotel" });
      if (result) {
        setHotelList((prev) => [
          ...prev,
          {
            id: result.id,
            name: result.name,
            address: result.address ?? "",
            phone: result.phone ?? "",
            notes: result.notes ?? "",
            bookingUrl: result.bookingUrl ?? "",
          },
        ]);
      }
    });
  };

  const handleUpdateHotel = (id: number, field: keyof Hotel, value: string) => {
    setHotelList((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
  };

  const handleSaveHotel = (hotel: Hotel) => {
    startTransition(async () => {
      await updateHotel(hotel.id, {
        name: hotel.name,
        address: hotel.address,
        phone: hotel.phone,
        notes: hotel.notes,
        bookingUrl: hotel.bookingUrl,
      });
    });
  };

  const handleRemoveHotel = (id: number) => {
    setHotelList((prev) => prev.filter((h) => h.id !== id));
    startTransition(async () => {
      await removeHotel(id);
    });
  };

  // ── Security handlers ──

  const handleSetPin = () => {
    setPinError("");
    setPinSuccess("");
    startTransition(async () => {
      const result = await setPin(hasPin ? currentPin : null, newPin);
      if (result.success) {
        setHasPin(true);
        setCurrentPin("");
        setNewPin("");
        setPinSuccess(hasPin ? "PIN updated" : "PIN set");
        setTimeout(() => setPinSuccess(""), 2000);
      } else {
        setPinError(result.error || "Failed");
      }
    });
  };

  const handleRemovePin = () => {
    setPinError("");
    setPinSuccess("");
    startTransition(async () => {
      const result = await removePin(currentPin);
      if (result.success) {
        setHasPin(false);
        setPasskeys([]);
        setCurrentPin("");
        setNewPin("");
        setPinSuccess("PIN removed");
        setTimeout(() => setPinSuccess(""), 2000);
      } else {
        setPinError(result.error || "Failed");
      }
    });
  };

  const handleAddPasskey = () => {
    setPinError("");
    startTransition(async () => {
      try {
        const options = await getPasskeyRegistrationOptions();
        const response = await startRegistration({ optionsJSON: options });
        const result = await completePasskeyRegistration(response);
        if (result.success) {
          setPinSuccess("Passkey registered");
          setTimeout(() => setPinSuccess(""), 2000);
          router.refresh();
        } else {
          setPinError(result.error || "Registration failed");
        }
      } catch {
        setPinError("Passkey registration cancelled");
      }
    });
  };

  const handleRemovePasskey = (id: string) => {
    startTransition(async () => {
      await removePasskey(id);
      setPasskeys((prev) => prev.filter((p) => p.id !== id));
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Couple</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partner1">Partner 1 Name</Label>
              <Input
                id="partner1"
                value={form.partner1Name}
                onChange={(e) => set("partner1Name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partner2">Partner 2 Name</Label>
              <Input
                id="partner2"
                value={form.partner2Name}
                onChange={(e) => set("partner2Name", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Date & Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weddingDate">Wedding Date</Label>
              <Input
                id="weddingDate"
                type="date"
                value={form.weddingDate}
                onChange={(e) => set("weddingDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ceremonyTime">Ceremony Time</Label>
              <Input
                id="ceremonyTime"
                placeholder="e.g. 4:00 PM"
                value={form.ceremonyTime}
                onChange={(e) => set("ceremonyTime", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receptionTime">Reception Time</Label>
              <Input
                id="receptionTime"
                placeholder="e.g. 5:30 PM"
                value={form.receptionTime}
                onChange={(e) => set("receptionTime", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Venue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="venueName">Venue Name</Label>
            <Input
              id="venueName"
              value={form.venueName}
              onChange={(e) => set("venueName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venueAddress">Address</Label>
            <Input
              id="venueAddress"
              value={form.venueAddress}
              onChange={(e) => set("venueAddress", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="venueCity">City</Label>
              <Input
                id="venueCity"
                value={form.venueCity}
                onChange={(e) => set("venueCity", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venueState">State</Label>
              <Input
                id="venueState"
                value={form.venueState}
                onChange={(e) => set("venueState", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venueZip">Zip</Label>
              <Input
                id="venueZip"
                value={form.venueZip}
                onChange={(e) => set("venueZip", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="venueMapUrl">Google Maps URL</Label>
            <Input
              id="venueMapUrl"
              value={form.venueMapUrl}
              onChange={(e) => set("venueMapUrl", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Planning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalBudget">Total Budget</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="totalBudget"
                  type="number"
                  value={form.totalBudget || ""}
                  onChange={(e) =>
                    set("totalBudget", parseFloat(e.target.value) || 0)
                  }
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rsvpDeadline">RSVP Deadline</Label>
              <Input
                id="rsvpDeadline"
                type="date"
                value={form.rsvpDeadline}
                onChange={(e) => set("rsvpDeadline", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dressCode">Dress Code</Label>
              <Input
                id="dressCode"
                value={form.dressCode}
                onChange={(e) => set("dressCode", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Travel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="directions">Directions</Label>
            <Textarea
              id="directions"
              value={form.directions}
              onChange={(e) => set("directions", e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parking">Parking</Label>
            <Textarea
              id="parking"
              value={form.parking}
              onChange={(e) => set("parking", e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading">Hotels</CardTitle>
            <Button size="sm" onClick={handleAddHotel} disabled={isPending}>
              <Plus className="h-4 w-4 mr-1" />
              Add Hotel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {hotelList.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hotels added yet.
            </p>
          ) : (
            <div className="space-y-4">
              {hotelList.map((hotel) => (
                <Card key={hotel.id} className="bg-muted/30">
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Name</Label>
                        <Input
                          value={hotel.name}
                          onChange={(e) =>
                            handleUpdateHotel(hotel.id, "name", e.target.value)
                          }
                          onBlur={() => handleSaveHotel(hotel)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Phone</Label>
                        <Input
                          value={hotel.phone}
                          onChange={(e) =>
                            handleUpdateHotel(hotel.id, "phone", e.target.value)
                          }
                          onBlur={() => handleSaveHotel(hotel)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Address</Label>
                      <Input
                        value={hotel.address}
                        onChange={(e) =>
                          handleUpdateHotel(hotel.id, "address", e.target.value)
                        }
                        onBlur={() => handleSaveHotel(hotel)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Booking URL</Label>
                      <Input
                        value={hotel.bookingUrl}
                        onChange={(e) =>
                          handleUpdateHotel(
                            hotel.id,
                            "bookingUrl",
                            e.target.value
                          )
                        }
                        onBlur={() => handleSaveHotel(hotel)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Notes</Label>
                      <Input
                        value={hotel.notes}
                        onChange={(e) =>
                          handleUpdateHotel(hotel.id, "notes", e.target.value)
                        }
                        onBlur={() => handleSaveHotel(hotel)}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveHotel(hotel.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* ── Security ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="font-heading">Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            {hasPin
              ? "Your planning pages are protected with a PIN."
              : "Set a numeric PIN to protect your planning pages."}
          </p>

          {/* PIN management */}
          <div className="space-y-3">
            {hasPin && (
              <div className="space-y-1.5">
                <Label htmlFor="currentPin">Current PIN</Label>
                <Input
                  id="currentPin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter current PIN"
                  value={currentPin}
                  onChange={(e) =>
                    setCurrentPin(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={8}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="newPin">
                {hasPin ? "New PIN" : "PIN (4–8 digits)"}
              </Label>
              <Input
                id="newPin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={hasPin ? "Enter new PIN" : "Choose a PIN"}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                maxLength={8}
              />
            </div>

            {pinError && (
              <p className="text-sm text-destructive">{pinError}</p>
            )}
            {pinSuccess && (
              <p className="text-sm text-green-600">{pinSuccess}</p>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSetPin}
                disabled={
                  isPending ||
                  newPin.length < 4 ||
                  (hasPin && !currentPin)
                }
              >
                <ShieldCheck className="h-4 w-4 mr-1" />
                {hasPin ? "Update PIN" : "Set PIN"}
              </Button>
              {hasPin && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={handleRemovePin}
                  disabled={isPending || !currentPin}
                >
                  <ShieldOff className="h-4 w-4 mr-1" />
                  Remove PIN
                </Button>
              )}
            </div>
          </div>

          {/* Passkey management — only available when PIN is set */}
          {hasPin && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Passkeys</p>
                    <p className="text-xs text-muted-foreground">
                      Use Face ID or Touch ID to unlock
                    </p>
                  </div>
                  {canWebAuthn && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddPasskey}
                      disabled={isPending}
                    >
                      <Fingerprint className="h-4 w-4 mr-1" />
                      Add Passkey
                    </Button>
                  )}
                </div>

                {passkeys.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No passkeys registered.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {passkeys.map((pk) => (
                      <div
                        key={pk.id}
                        className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <Fingerprint className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Registered{" "}
                            {pk.createdAt
                              ? new Date(pk.createdAt).toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemovePasskey(pk.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
