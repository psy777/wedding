import Navbar from "@/components/ui/Navbar";
import Flower from "@/components/ui/Flower";
import SectionLabel from "@/components/ui/SectionLabel";
import ContributeButtons from "@/components/borabora/ContributeButtons";

const experiences = [
  {
    name: "Overwater Villa",
    description:
      "A glass-floor bungalow above the lagoon — waking up to Mount Otemanu every morning.",
    gradient: "from-[#023E8A] to-[#0077B6]",
  },
  {
    name: "Lagoon Snorkeling",
    description:
      "Swimming with blacktip reef sharks, manta rays, and tropical fish in crystal-clear water.",
    gradient: "from-[#0096C7] to-[#48CAE4]",
  },
  {
    name: "Sunset Sail",
    description:
      "A private catamaran cruise as the sun dips behind Bora Bora's volcanic peaks.",
    gradient: "from-[#BC4749] to-[#E76F51]",
  },
  {
    name: "Jet Ski Tour",
    description:
      "Racing across the lagoon, weaving between motus and soaking in the island views.",
    gradient: "from-[#168AAD] to-[#34A0A4]",
  },
  {
    name: "Polynesian Spa",
    description:
      "A couples treatment with mono\u00ef oil, vanilla, and local botanicals — pure island bliss.",
    gradient: "from-[#1B4332] to-[#2D6A4F]",
  },
  {
    name: "Private Motu Picnic",
    description:
      "A catered lunch on a tiny deserted island — white sand, palm trees, and just the two of us.",
    gradient: "from-[#BC6C25] to-[#DDA15E]",
  },
  {
    name: "Coral Garden Dive",
    description:
      "Exploring vibrant coral formations in one of the world\u2019s most pristine marine environments.",
    gradient: "from-[#5A189A] to-[#7B2CBF]",
  },
  {
    name: "Helicopter Tour",
    description:
      "Soaring above the islands for breathtaking views of the lagoon, reef, and volcanic peaks.",
    gradient: "from-[#1D3557] to-[#457B9D]",
  },
];

export default function BoraBoraPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero — ocean gradient fading into linen */}
        <section
          className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 px-4 sm:px-6 text-center"
          style={{
            background:
              "linear-gradient(180deg, #023E8A 0%, #0077B6 30%, #48CAE4 60%, #90E0EF 80%, #FEFAE0 100%)",
          }}
        >
          <div className="max-w-2xl mx-auto relative z-10 animate-fade-in-up">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
              <Flower color="coral" size={14} />
              <p className="text-sm sm:text-base uppercase tracking-[0.3em] text-white/80 font-body">
                One Year Anniversary
              </p>
              <Flower color="coral" size={14} />
            </div>
            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl text-white font-light mb-3 drop-shadow-lg">
              Bora Bora
            </h1>
            <p className="text-lg sm:text-xl text-white/70 font-body tracking-wide">
              June 2027 &middot; French Polynesia
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 bg-linen">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-base sm:text-lg text-clay leading-relaxed font-body">
              To celebrate our first year of marriage, we&apos;re dreaming of an
              adventure to Bora Bora in French Polynesia — turquoise lagoons,
              overwater bungalows, and a week of pure paradise. Your presence at
              our wedding is the greatest gift we could ask for, but if you&apos;d
              like to contribute to this once-in-a-lifetime trip, it would mean the
              world to us.
            </p>
          </div>
        </section>

        {/* Experiences */}
        <section className="pb-16 sm:pb-24 px-4 sm:px-6 bg-linen">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <SectionLabel
                before={[{ color: "purple", size: 12 }]}
                after={[{ color: "coral", size: 12 }]}
                className="justify-center"
              >
                Adventures Ahead
              </SectionLabel>
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-ink font-light">
                What We&apos;re Dreaming Of
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {experiences.map((exp) => (
                <div
                  key={exp.name}
                  className={`bg-gradient-to-br ${exp.gradient} rounded-xl p-6 sm:p-7 min-h-[200px] flex flex-col justify-end shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
                >
                  <h3 className="font-heading text-xl sm:text-2xl text-white font-light mb-1.5">
                    {exp.name}
                  </h3>
                  <p className="text-sm sm:text-base text-white/85 font-body leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contribute */}
        <section className="py-14 sm:py-20 px-4 sm:px-6 bg-parchment border-t border-sand/40">
          <div className="max-w-xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Flower color="purple" size={12} />
              <Flower color="coral" size={8} />
              <p className="text-base sm:text-lg uppercase tracking-[0.25em] text-gold font-body mx-1">
                Contribute
              </p>
              <Flower color="coral" size={8} />
              <Flower color="purple" size={12} />
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl text-ink font-light mb-4">
              Send Us on Our Way
            </h2>
            <p className="text-base sm:text-lg text-clay font-body leading-relaxed mb-8">
              Any amount is deeply appreciated — every little bit brings us closer
              to paradise. There&apos;s no minimum and no expectation.
            </p>
            <ContributeButtons />
          </div>
        </section>
      </main>

      <footer className="py-6 sm:py-8 text-center text-base sm:text-lg text-clay tracking-wide bg-parchment border-t border-sand/40 font-body">
        <p>Made with love</p>
      </footer>
    </>
  );
}
