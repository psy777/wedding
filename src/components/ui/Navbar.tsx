"use client";

import Link from "next/link";
import { useState } from "react";
import { WEDDING } from "@/config/wedding";
import Sheet from "@/components/ui/Sheet";
import Flower from "@/components/ui/Flower";
import { buttonVariants } from "@/components/ui/button";

interface Props {
  partner1?: string;
  partner2?: string;
}

export default function Navbar({ partner1, partner2 }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const p1 = partner1 || WEDDING.couple.partner1;
  const p2 = partner2 || WEDDING.couple.partner2;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-linen/95 backdrop-blur-md border-b border-sand/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link
              href="/"
              className="font-heading text-xl sm:text-2xl text-ink tracking-[0.06em] font-light"
            >
              {p1} & {p2}
            </Link>

            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-6 lg:gap-8">
              <Link
                href="/#details"
                className="text-base lg:text-lg text-clay hover:text-ink transition-colors duration-300 tracking-[0.05em] uppercase font-body"
              >
                Details
              </Link>
              <Link
                href="/#travel"
                className="text-base lg:text-lg text-clay hover:text-ink transition-colors duration-300 tracking-[0.05em] uppercase font-body"
              >
                Travel
              </Link>
              <Link
                href="/#registry"
                className="text-base lg:text-lg text-clay hover:text-ink transition-colors duration-300 tracking-[0.05em] uppercase font-body"
              >
                Registry
              </Link>
              <Link
                href="/rsvp"
                className={buttonVariants({ variant: "default", size: "sm", className: "uppercase tracking-[0.1em]" })}
              >
                RSVP
              </Link>
              <Link
                href="/plan"
                className="opacity-60 hover:opacity-100 transition-opacity duration-300"
                aria-label="Planning login"
              >
                <Flower color="blue" size={20} />
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="sm:hidden p-2 text-clay active:text-ink"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-out sheet */}
      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)}>
        <div className="flex flex-col pt-16 px-6">
          <div className="flex items-center gap-2 mb-8">
            <Flower color="coral" size={12} />
            <Flower color="purple" size={10} />
            <Link
              href="/plan"
              className="opacity-50 hover:opacity-100 transition-opacity duration-300 ml-1"
              onClick={() => setMenuOpen(false)}
              aria-label="Planning login"
            >
              <Flower color="blue" size={14} />
            </Link>
          </div>
          <div className="flex flex-col gap-6">
            <Link
              href="/#details"
              className="text-xl text-clay hover:text-ink tracking-[0.05em] uppercase font-body"
              onClick={() => setMenuOpen(false)}
            >
              Details
            </Link>
            <Link
              href="/#travel"
              className="text-xl text-clay hover:text-ink tracking-[0.05em] uppercase font-body"
              onClick={() => setMenuOpen(false)}
            >
              Travel
            </Link>
            <Link
              href="/#registry"
              className="text-xl text-clay hover:text-ink tracking-[0.05em] uppercase font-body"
              onClick={() => setMenuOpen(false)}
            >
              Registry
            </Link>
            <div className="border-t border-sand/40 pt-6 mt-2">
              <Link
                href="/rsvp"
                className={buttonVariants({ variant: "default", className: "block w-full text-center text-xl uppercase tracking-[0.1em]" })}
                onClick={() => setMenuOpen(false)}
              >
                RSVP
              </Link>
            </div>
          </div>
        </div>
      </Sheet>
    </>
  );
}
