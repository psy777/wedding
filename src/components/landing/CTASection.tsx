import Link from "next/link";
import { WEDDING } from "@/config/wedding";

export default function CTASection() {
  return (
    <section className="py-20 px-4 bg-white text-center">
      <div className="max-w-xl mx-auto">
        <h2 className="font-heading text-3xl sm:text-4xl text-stone-800 mb-4">
          Will You Join Us?
        </h2>
        <p className="text-stone-600 mb-8">
          We can&apos;t wait to celebrate with you. Please let us know if you
          can make it.
        </p>
        <Link
          href="/rsvp"
          className="inline-block px-8 py-4 bg-stone-800 text-white text-lg rounded-md hover:bg-stone-900 transition-colors"
        >
          RSVP Now
        </Link>
        <p className="text-sm text-stone-400 mt-4">
          Please respond by {WEDDING.rsvpDeadline.display}
        </p>
      </div>
    </section>
  );
}
