import { WEDDING } from "@/config/wedding";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-stone-100">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25px 25px, #78716c 1px, transparent 0)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative text-center px-4 animate-fade-in-up">
        <p className="text-sm uppercase tracking-[0.3em] text-stone-500 mb-6">
          Together with their families
        </p>
        <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl text-stone-800 mb-4 leading-tight">
          {WEDDING.couple.partner1}
          <span className="block text-3xl sm:text-4xl md:text-5xl text-rose-400 my-2 italic">
            &amp;
          </span>
          {WEDDING.couple.partner2}
        </h1>
        <div className="w-24 h-px bg-rose-400 mx-auto my-8" />
        <p className="text-lg sm:text-xl text-stone-600 tracking-wide animation-delay-200 animate-fade-in-up">
          {WEDDING.date.full}
        </p>
        <p className="text-base text-stone-500 mt-2 animation-delay-400 animate-fade-in-up">
          {WEDDING.venue.name} &middot; {WEDDING.venue.city},{" "}
          {WEDDING.venue.state}
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animation-delay-600 animate-fade-in-up">
        <div className="w-6 h-10 border-2 border-stone-400 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-stone-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
