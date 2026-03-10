import Navbar from "@/components/ui/Navbar";
import Hero from "@/components/landing/Hero";
import EventDetails from "@/components/landing/EventDetails";
import TravelSection from "@/components/landing/TravelSection";
import CTASection from "@/components/landing/CTASection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <EventDetails />
        <TravelSection />
        <CTASection />
      </main>
      <footer className="py-8 text-center text-sm text-stone-400 bg-stone-50 border-t border-stone-200">
        <p>Made with love</p>
      </footer>
    </>
  );
}
