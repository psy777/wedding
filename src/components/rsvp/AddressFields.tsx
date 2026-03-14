"use client";

import Input from "@/components/ui/Input";

interface AddressFieldsProps {
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  onPhoneChange: (value: string) => void;
  onStreetChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onZipChange: (value: string) => void;
}

export default function AddressFields({
  phone,
  streetAddress,
  city,
  state,
  zip,
  onPhoneChange,
  onStreetChange,
  onCityChange,
  onStateChange,
  onZipChange,
}: AddressFieldsProps) {
  return (
    <div className="py-5 border-b border-sand/50">
      <p className="text-lg uppercase tracking-[0.2em] text-gold mb-5 font-body">
        Your Contact Information
      </p>

      <div className="space-y-4">
        <Input
          label="Phone Number"
          type="tel"
          placeholder="(512) 555-0100"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
        />

        <Input
          label="Street Address"
          placeholder="123 Main St"
          value={streetAddress}
          onChange={(e) => onStreetChange(e.target.value)}
        />

        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-2">
            <Input
              label="City"
              placeholder="City"
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
            />
          </div>
          <div className="col-span-1">
            <Input
              label="State"
              placeholder="TX"
              value={state}
              onChange={(e) => onStateChange(e.target.value)}
              maxLength={2}
            />
          </div>
          <div className="col-span-2">
            <Input
              label="Zip"
              placeholder="78701"
              value={zip}
              onChange={(e) => onZipChange(e.target.value)}
              maxLength={10}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
