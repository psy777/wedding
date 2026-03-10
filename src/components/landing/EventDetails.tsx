import { WEDDING } from "@/config/wedding";

export default function EventDetails() {
  return (
    <section id="details" className="py-20 px-4 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-heading text-3xl sm:text-4xl text-stone-800 mb-12">
          Event Details
        </h2>

        <div className="grid sm:grid-cols-2 gap-10">
          {/* Ceremony */}
          <div className="p-8 rounded-lg bg-stone-50">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-rose-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="font-heading text-xl text-stone-800 mb-2">
              Ceremony
            </h3>
            <p className="text-stone-600">{WEDDING.time.ceremony}</p>
          </div>

          {/* Reception */}
          <div className="p-8 rounded-lg bg-stone-50">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="font-heading text-xl text-stone-800 mb-2">
              Reception
            </h3>
            <p className="text-stone-600">{WEDDING.time.reception}</p>
          </div>
        </div>

        {/* Venue */}
        <div className="mt-12 p-8 rounded-lg bg-stone-50">
          <h3 className="font-heading text-xl text-stone-800 mb-2">
            {WEDDING.venue.name}
          </h3>
          <p className="text-stone-600">
            {WEDDING.venue.address}
            <br />
            {WEDDING.venue.city}, {WEDDING.venue.state} {WEDDING.venue.zip}
          </p>
          <a
            href={WEDDING.venue.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-sm text-rose-500 hover:text-rose-600 underline underline-offset-4 transition-colors"
          >
            View on Google Maps
          </a>
        </div>

        {/* Dress Code */}
        <div className="mt-10">
          <p className="text-sm uppercase tracking-[0.2em] text-stone-400 mb-1">
            Dress Code
          </p>
          <p className="text-lg text-stone-700">{WEDDING.dressCode}</p>
        </div>
      </div>
    </section>
  );
}
