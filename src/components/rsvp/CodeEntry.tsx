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
      <p className="text-lg uppercase tracking-[0.3em] text-gold mb-3 font-body">
        You&apos;re Invited
      </p>
      <h1 className="font-heading text-3xl sm:text-4xl text-ink font-light mb-3">
        RSVP
      </h1>
      <p className="text-xl text-clay mb-10 font-body">
        Enter the code from your invitation to get started.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          type="text"
          placeholder="e.g. SMITH2026"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="text-center text-xl tracking-[0.15em]"
          autoFocus
        />

        {error && (
          <p className="text-wine text-lg">{error}</p>
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
