"use client";

import Link from "next/link";
import { useState } from "react";
import { WEDDING } from "@/config/wedding";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-50/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="font-heading text-xl text-stone-800 tracking-wide"
          >
            {WEDDING.couple.partner1} & {WEDDING.couple.partner2}
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-6">
            <Link
              href="/#details"
              className="text-sm text-stone-600 hover:text-stone-800 transition-colors"
            >
              Details
            </Link>
            <Link
              href="/#travel"
              className="text-sm text-stone-600 hover:text-stone-800 transition-colors"
            >
              Travel
            </Link>
            <Link
              href="/rsvp"
              className="text-sm px-4 py-2 bg-stone-800 text-white rounded-md hover:bg-stone-900 transition-colors"
            >
              RSVP
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 text-stone-600"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden pb-4 border-t border-stone-200 pt-2">
            <div className="flex flex-col gap-2">
              <Link
                href="/#details"
                className="px-3 py-2 text-sm text-stone-600 hover:text-stone-800"
                onClick={() => setMenuOpen(false)}
              >
                Details
              </Link>
              <Link
                href="/#travel"
                className="px-3 py-2 text-sm text-stone-600 hover:text-stone-800"
                onClick={() => setMenuOpen(false)}
              >
                Travel
              </Link>
              <Link
                href="/rsvp"
                className="mx-3 text-center text-sm px-4 py-2 bg-stone-800 text-white rounded-md hover:bg-stone-900"
                onClick={() => setMenuOpen(false)}
              >
                RSVP
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
