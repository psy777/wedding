"use client";

import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddressFieldsProps {
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  onStreetChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onZipChange: (value: string) => void;
}

export default function AddressFields({
  streetAddress,
  city,
  state,
  zip,
  onStreetChange,
  onCityChange,
  onStateChange,
  onZipChange,
}: AddressFieldsProps) {
  return (
    <div className="py-5 border-b border-sand/50">
      <p className="text-lg uppercase tracking-[0.2em] text-gold mb-5 font-body">
        Your Mailing Address
      </p>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Street Address <span className="text-gold">*</span></Label>
          <Input
            placeholder="123 Main St"
            value={streetAddress}
            onChange={(e) => onStreetChange(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label>City <span className="text-gold">*</span></Label>
            <Input
              placeholder="City"
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              required
            />
          </div>
          <div className="col-span-1 space-y-1.5">
            <Label>State <span className="text-gold">*</span></Label>
            <Input
              placeholder="TX"
              value={state}
              onChange={(e) => onStateChange(e.target.value)}
              maxLength={2}
              required
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Zip <span className="text-gold">*</span></Label>
            <Input
              placeholder="78701"
              value={zip}
              onChange={(e) => onZipChange(e.target.value)}
              maxLength={10}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}
