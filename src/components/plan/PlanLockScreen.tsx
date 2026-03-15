"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import {
  verifyPin,
  getPasskeyAuthOptions,
  completePasskeyAuth,
} from "@/actions/plan-auth";
import { startAuthentication, browserSupportsWebAuthn } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import { Lock, Fingerprint, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  hasPasskeys: boolean;
}

export default function PlanLockScreen({ hasPasskeys }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [supportsPasskey, setSupportsPasskey] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setSupportsPasskey(hasPasskeys && browserSupportsWebAuthn());
  }, [hasPasskeys]);

  const handlePasskeyAuth = useCallback(() => {
    setError("");
    startTransition(async () => {
      try {
        const options = await getPasskeyAuthOptions();
        if (!options) {
          setError("No passkeys registered");
          return;
        }
        const response = await startAuthentication({ optionsJSON: options });
        const result = await completePasskeyAuth(response);
        if (result.success) {
          router.refresh();
        } else {
          setError("Passkey verification failed");
        }
      } catch {
        setError("Passkey authentication cancelled");
      }
    });
  }, [router, startTransition]);

  // Auto-trigger passkey on mount if available
  useEffect(() => {
    if (supportsPasskey) {
      handlePasskeyAuth();
    }
  }, [supportsPasskey, handlePasskeyAuth]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await verifyPin(pin);
      if (result.success) {
        router.refresh();
      } else {
        setError("Incorrect PIN");
        setPin("");
      }
    });
  };

  return (
    <div className="w-full max-w-sm mx-auto text-center pt-24">
      <div className="mb-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Lock className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="font-heading text-2xl text-foreground mb-1">
          Wedding Planner
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your PIN to continue
        </p>
      </div>

      <form onSubmit={handlePinSubmit} className="space-y-4">
        <Input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="PIN"
          value={pin}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            setPin(v);
          }}
          className="text-center text-2xl tracking-[0.5em] font-mono"
          autoFocus
          maxLength={8}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          className="w-full"
          disabled={isPending || pin.length < 4}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Unlock"
          )}
        </Button>
      </form>

      {supportsPasskey && (
        <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handlePasskeyAuth}
            disabled={isPending}
          >
            <Fingerprint className="h-5 w-5" />
            Use Passkey
          </Button>
        </>
      )}
    </div>
  );
}
