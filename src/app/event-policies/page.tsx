import Navbar from "@/components/ui/Navbar";
import { WEDDING } from "@/config/wedding";

export default function EventPoliciesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-linen pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-heading text-3xl text-ink font-light mb-8 text-center">
            Event Policies
          </h1>
          <div className="text-lg text-clay leading-relaxed whitespace-pre-line font-body">
            {WEDDING.tos}
          </div>
        </div>
      </main>
    </>
  );
}
