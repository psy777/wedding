"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ContributeButtons() {
  const [copied, setCopied] = useState(false);

  const copyPhone = () => {
    navigator.clipboard.writeText("6362959014");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      {/* Venmo */}
      <a
        href="https://venmo.com/calebehansen"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#008CFF] text-white rounded-lg font-body text-base tracking-wide hover:bg-[#0074D4] transition-colors shadow-sm"
      >
        <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
          <path d="M19.885 3.382c.612 1.005.886 2.04.886 3.353 0 4.178-3.567 9.6-6.458 13.407H8.124L5.888 2.59l5.396-.512 1.237 9.942c1.152-1.877 2.576-4.836 2.576-6.862 0-1.248-.214-2.1-.55-2.794l5.338-2.982z" />
        </svg>
        Venmo
      </a>

      {/* Zelle */}
      <Dialog>
        <DialogTrigger
          className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#6D1ED4] text-white rounded-lg font-body text-base tracking-wide hover:bg-[#5A18B0] transition-colors shadow-sm cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
            <path d="M13.559 24h-2.841a.483.483 0 0 1-.483-.483V16.2h-3.49a.483.483 0 0 1-.398-.756l6.159-8.928a.483.483 0 0 1 .881.275v7.006h3.49a.483.483 0 0 1 .398.756l-6.159 8.928a.484.484 0 0 1-.557.203.483.483 0 0 1-.324-.456V24z" />
          </svg>
          Zelle
        </DialogTrigger>
        <DialogContent className="bg-linen">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-ink font-light text-center">
              Send via Zelle
            </DialogTitle>
            <DialogDescription className="text-clay font-body text-center text-base mt-1">
              Use the phone number below to send a Zelle payment.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 pt-2 pb-1">
            <p className="text-2xl font-body text-ink tracking-wider">
              (636) 295-9014
            </p>
            <button
              onClick={copyPhone}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6D1ED4] text-white rounded-lg font-body text-sm tracking-wide hover:bg-[#5A18B0] transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  Copy Number
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
