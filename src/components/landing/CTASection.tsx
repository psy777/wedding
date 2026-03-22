"use client";

import Link from "next/link";
import Flower from "@/components/ui/Flower";
import { buttonVariants } from "@/components/ui/button";

interface Props {
  rsvpDeadlineDisplay: string;
}

export default function CTASection({ rsvpDeadlineDisplay }: Props) {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-linen text-center overflow-hidden">
      <div className="max-w-xl mx-auto relative">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Flower color="purple" size={12} />
          <Flower color="coral" size={8} />
          <p className="text-base sm:text-lg uppercase tracking-[0.25em] sm:tracking-[0.3em] text-gold font-body mx-1 sm:mx-2">
            We Hope to See You
          </p>
          <Flower color="coral" size={8} />
          <Flower color="purple" size={12} />
        </div>
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-ink font-light mb-3 sm:mb-4">
          Will You Join Us?
        </h2>
        <p className="text-base sm:text-xl text-clay mb-8 sm:mb-10 font-body">
          We can&apos;t wait to celebrate with you. Please let us know if you
          can make it.
        </p>
        <Link
          href="/rsvp"
          className={buttonVariants({ variant: "default", size: "lg", className: "text-xl sm:text-2xl py-6 px-10 sm:py-7 sm:px-12 uppercase tracking-[0.15em]" })}
        >
          RSVP
        </Link>
        {rsvpDeadlineDisplay && (
          <p className="text-base sm:text-lg text-clay mt-5 sm:mt-6 tracking-wide font-body">
            Please respond by {rsvpDeadlineDisplay}
          </p>
        )}
      </div>
    </section>
  );
}
