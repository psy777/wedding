import Link from "next/link";

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
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-600 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="font-heading text-3xl text-stone-800 mb-3">
        {isUpdate ? "RSVP Updated!" : "Thank You!"}
      </h2>

      <p className="text-stone-600 mb-2">
        {isUpdate
          ? `Your RSVP has been updated, ${name}.`
          : `We've received your RSVP, ${name}.`}
      </p>

      <p className="text-stone-500 text-sm mb-8">
        {isUpdate
          ? "Your changes have been saved. You can come back and update again before the deadline."
          : "We can't wait to celebrate with you! You can come back and update your response before the deadline if anything changes."}
      </p>

      <Link
        href="/"
        className="inline-block px-6 py-3 bg-stone-800 text-white rounded-md hover:bg-stone-900 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
