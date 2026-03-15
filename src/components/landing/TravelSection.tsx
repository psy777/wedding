import SectionLabel from "@/components/ui/SectionLabel";

interface Hotel {
  id: number;
  name: string;
  address: string;
  phone: string;
  notes: string;
  bookingUrl: string;
}

interface Props {
  hotels: Hotel[];
  directions: string;
  parking: string;
}

export default function TravelSection({ hotels, directions, parking }: Props) {
  return (
    <section id="travel" className="py-16 sm:py-24 px-4 sm:px-6 md:px-8 bg-parchment">
      <div className="max-w-2xl mx-auto">
        <SectionLabel
          before={[{ color: "purple", size: 14 }]}
          after={[{ color: "coral", size: 10 }]}
        >
          Plan Your Visit
        </SectionLabel>
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-ink font-light mb-10 sm:mb-16">
          Travel &amp; Accommodation
        </h2>

        {/* Hotels */}
        <div className="mb-12 sm:mb-16">
          <SectionLabel before={[{ color: "coral", size: 10 }]} className="mb-4 sm:mb-6">
            Where to Stay
          </SectionLabel>
          <div className="space-y-0">
            {hotels.filter((h) => h.name).map((hotel) => (
              <div
                key={hotel.id}
                className="py-5 sm:py-6 border-b border-sand/60 first:pt-0 last:border-b-0"
              >
                <h4 className="font-heading text-lg sm:text-xl text-ink font-light mb-1">
                  {hotel.name}
                </h4>
                <p className="text-base sm:text-lg text-clay font-body">{hotel.address}</p>
                <p className="text-base sm:text-lg text-clay font-body">{hotel.phone}</p>
                {hotel.notes && (
                  <p className="text-base sm:text-lg text-clay/70 mt-2 italic font-body">
                    {hotel.notes}
                  </p>
                )}
                {hotel.bookingUrl && hotel.bookingUrl !== "#" && (
                  <a
                    href={hotel.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-base sm:text-lg text-ink underline underline-offset-4 decoration-sand hover:decoration-ink transition-colors duration-300 font-body"
                  >
                    Book Now
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Directions & Parking */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
          <div>
            <SectionLabel before={[{ color: "purple", size: 10 }]} className="mb-3 sm:mb-4">
              Getting There
            </SectionLabel>
            <p className="text-base sm:text-xl text-clay leading-relaxed font-body">
              {directions}
            </p>
          </div>
          <div>
            <SectionLabel before={[{ color: "coral", size: 10 }]} className="mb-3 sm:mb-4">
              Parking
            </SectionLabel>
            <p className="text-base sm:text-xl text-clay leading-relaxed font-body">
              {parking}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
