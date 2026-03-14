import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";

interface SubmissionConfirmationProps {
  name: string;
  isUpdate: boolean;
}

export default function SubmissionConfirmation({
  name,
  isUpdate,
}: SubmissionConfirmationProps) {
  return (
    <div className="max-w-md mx-auto text-center animate-fade-in-up">
      {/* Gold line accent instead of green circle */}
      <div className="w-px h-12 bg-gold/50 mx-auto mb-8" />

      <p className="text-lg uppercase tracking-[0.3em] text-gold mb-3 font-body">
        {isUpdate ? "Updated" : "Confirmed"}
      </p>

      <h2 className="font-heading text-3xl text-ink font-light mb-3">
        {isUpdate ? "RSVP Updated" : "Thank You"}
      </h2>

      <p className="text-xl text-ink/80 mb-2 font-body">
        {isUpdate
          ? `Your RSVP has been updated, ${name}.`
          : `We've received your RSVP, ${name}.`}
      </p>

      <p className="text-lg text-clay mb-10 font-body">
        {isUpdate
          ? "Your changes have been saved. You can come back and update again before the deadline."
          : "We can't wait to celebrate with you! You can come back and update your response before the deadline if anything changes."}
      </p>

      <Link
        href="/"
        className={buttonVariants({ variant: "primary", className: "uppercase tracking-[0.1em]" })}
      >
        Back to Home
      </Link>
    </div>
  );
}
