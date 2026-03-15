"use client";

import { useState, useTransition } from "react";
import { updateSettings, addHotel, updateHotel, removeHotel } from "@/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";

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

interface Props {
  settings: Settings;
  hotels: Hotel[];
}

export default function SettingsForm({
  settings: initial,
  hotels: initialHotels,
}: Props) {
  const [form, setForm] = useState<Settings>(initial);
  const [hotelList, setHotelList] = useState<Hotel[]>(initialHotels);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

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
    </div>
  );
}
