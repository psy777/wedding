import { WEDDING } from "@/config/wedding";
import Flower from "@/components/ui/Flower";
import SectionLabel from "@/components/ui/SectionLabel";

export default function EventDetails() {
  return (
    <section id="details" className="py-16 sm:py-24 px-4 sm:px-6 md:px-8 bg-linen">
      <div className="max-w-2xl mx-auto">
        <SectionLabel
          before={[{ color: "coral", size: 14 }]}
          after={[{ color: "purple", size: 10 }]}
        >
          The Day
        </SectionLabel>
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-ink font-light mb-10 sm:mb-16">
          Event Details
        </h2>

        {/* Timeline layout */}
        <div className="space-y-0">
          {/* Ceremony */}
          <div className="grid grid-cols-[80px_1px_1fr] sm:grid-cols-[160px_1px_1fr] gap-4 sm:gap-8 items-start">
            <div className="text-right pt-0.5">
              <p className="text-base sm:text-lg text-clay tracking-wide font-body">
                {WEDDING.time.ceremony}
              </p>
            </div>
            <div className="relative flex flex-col items-center">
              <Flower color="purple" size={10} className="mt-0.5 shrink-0" />
              <div className="w-px flex-1 bg-sand" />
            </div>
            <div className="pb-10 sm:pb-12">
              <h3 className="font-heading text-xl sm:text-2xl text-ink font-light">
                Ceremony
              </h3>
            </div>
          </div>

          {/* Reception */}
          <div className="grid grid-cols-[80px_1px_1fr] sm:grid-cols-[160px_1px_1fr] gap-4 sm:gap-8 items-start">
            <div className="text-right pt-0.5">
              <p className="text-base sm:text-lg text-clay tracking-wide font-body">
                {WEDDING.time.reception}
              </p>
            </div>
            <div className="relative flex flex-col items-center">
              <Flower color="coral" size={10} className="mt-0.5 shrink-0" />
            </div>
            <div>
              <h3 className="font-heading text-xl sm:text-2xl text-ink font-light">
                Reception
              </h3>
            </div>
          </div>
        </div>

        {/* Venue */}
        <div className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-sand/60">
          <SectionLabel before={[{ color: "purple", size: 12 }]}>
            Venue
          </SectionLabel>
          <h3 className="font-heading text-xl sm:text-2xl text-ink font-light mb-2">
            {WEDDING.venue.name}
          </h3>
          <p className="text-base sm:text-xl text-clay leading-relaxed font-body">
            {WEDDING.venue.address}
            <br />
            {WEDDING.venue.city}, {WEDDING.venue.state} {WEDDING.venue.zip}
          </p>
          <a
            href={WEDDING.venue.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-base sm:text-lg text-ink underline underline-offset-4 decoration-sand hover:decoration-ink transition-colors duration-300 font-body"
          >
            View on Google Maps
          </a>
        </div>

        {/* Dress Code */}
        <div className="mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-sand/60">
          <SectionLabel before={[{ color: "coral", size: 12 }]}>
            Dress Code
          </SectionLabel>
          <p className="font-heading text-xl sm:text-2xl text-ink font-light">
            {WEDDING.dressCode}
          </p>
        </div>
      </div>
    </section>
  );
}
