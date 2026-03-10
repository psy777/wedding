import { WEDDING } from "@/config/wedding";

export default function TravelSection() {
  return (
    <section id="travel" className="py-20 px-4 bg-stone-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-heading text-3xl sm:text-4xl text-stone-800 mb-12 text-center">
          Travel & Accommodation
        </h2>

        {/* Hotels */}
        <div className="space-y-6 mb-12">
          <h3 className="font-heading text-xl text-stone-700 mb-4">
            Where to Stay
          </h3>
          {WEDDING.travel.hotels.filter((h) => h.name).map((hotel, idx) => (
            <div
              key={idx}
              className="p-6 bg-white rounded-lg border border-stone-200"
            >
              <h4 className="font-semibold text-stone-800 text-lg">
                {hotel.name}
              </h4>
              <p className="text-stone-600 text-sm mt-1">{hotel.address}</p>
              <p className="text-stone-600 text-sm">{hotel.phone}</p>
              {hotel.notes && (
                <p className="text-stone-500 text-sm mt-2 italic">
                  {hotel.notes}
                </p>
              )}
              {hotel.bookingUrl && hotel.bookingUrl !== "#" && (
                <a
                  href={hotel.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm text-rose-500 hover:text-rose-600 underline underline-offset-4 transition-colors"
                >
                  Book Now
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Directions & Parking */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-lg border border-stone-200">
            <h3 className="font-heading text-lg text-stone-700 mb-3">
              Getting There
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              {WEDDING.travel.directions}
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg border border-stone-200">
            <h3 className="font-heading text-lg text-stone-700 mb-3">
              Parking
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              {WEDDING.travel.parking}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
