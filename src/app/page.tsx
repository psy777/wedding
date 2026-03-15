import Navbar from "@/components/ui/Navbar";
import Hero from "@/components/landing/Hero";
import EventDetails from "@/components/landing/EventDetails";
import TravelSection from "@/components/landing/TravelSection";
import CTASection from "@/components/landing/CTASection";
import Flower from "@/components/ui/Flower";
import SectionLabel from "@/components/ui/SectionLabel";
import { getWeddingConfig } from "@/lib/get-wedding-config";

function RegistrySection() {
  return (
    <section id="registry" className="py-16 sm:py-24 px-4 sm:px-6 md:px-8 bg-linen">
      <div className="max-w-2xl mx-auto">
        <SectionLabel
          before={[{ color: "coral", size: 14 }]}
          after={[{ color: "purple", size: 10 }]}
        >
          Registry
        </SectionLabel>
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-ink font-light mb-8 sm:mb-10">
          Gifts
        </h2>

        <p className="text-base sm:text-xl text-clay leading-relaxed font-body italic">
          We&apos;re lucky to already have a full home — your presence is the
          real gift. If you&apos;d like to contribute something, we&apos;ve set
          up a honeymoon fund.
        </p>
      </div>
    </section>
  );
}

function SageDivider() {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 py-1 bg-sand/20">
      <div className="h-px flex-1 max-w-16 sm:max-w-24 bg-sand/60" />
      <Flower color="coral" size={6} />
      <div className="w-5 sm:w-8 h-px bg-sand" />
      <Flower color="purple" size={8} />
      <div className="w-5 sm:w-8 h-px bg-sand" />
      <Flower color="coral" size={6} />
      <div className="h-px flex-1 max-w-16 sm:max-w-24 bg-sand/60" />
    </div>
  );
}

export default async function Home() {
  const config = await getWeddingConfig();

  return (
    <>
      <Navbar
        partner1={config.couple.partner1}
        partner2={config.couple.partner2}
      />
      <main>
        <Hero
          partner1={config.couple.partner1}
          partner2={config.couple.partner2}
          dateFull={config.date.full}
          venueName={config.venue.name}
          venueCity={config.venue.city}
          venueState={config.venue.state}
        />
        <SageDivider />
        <EventDetails
          ceremonyTime={config.time.ceremony}
          receptionTime={config.time.reception}
          venue={config.venue}
          dressCode={config.dressCode}
        />
        <SageDivider />
        <TravelSection
          hotels={config.travel.hotels}
          directions={config.travel.directions}
          parking={config.travel.parking}
        />
        <SageDivider />
        <RegistrySection />
        <SageDivider />
        <CTASection rsvpDeadlineDisplay={config.rsvpDeadline.display} />
      </main>
      <footer className="py-6 sm:py-8 text-center text-base sm:text-lg text-clay tracking-wide bg-parchment border-t border-sand/40 font-body">
        <p>Made with love</p>
      </footer>
    </>
  );
}
