"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface CodeEntryProps {
  onLookup: (code: string) => Promise<void>;
  loading: boolean;
  error: string;
}

export default function CodeEntry({ onLookup, loading, error }: CodeEntryProps) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLookup(code);
  };

  return (
    <div className="max-w-md mx-auto text-center animate-fade-in-up">
      <h1 className="font-heading text-3xl sm:text-4xl text-stone-800 mb-3">
        RSVP
      </h1>
      <p className="text-stone-600 mb-8">
        Enter the code from your invitation to get started.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="e.g. SMITH2026"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="text-center text-lg tracking-widest"
          autoFocus
        />

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <Button
          type="submit"
          loading={loading}
          disabled={!code.trim()}
          className="w-full"
        >
          Look Up My Invitation
        </Button>
      </form>
    </div>
  );
}
