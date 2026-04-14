interface RSVPClosedProps {
  reason: "deadline" | "capacity";
}

export default function RSVPClosed({ reason }: RSVPClosedProps) {
  return (
    <div className="max-w-md mx-auto text-center animate-fade-in-up">
      <p className="text-lg uppercase tracking-[0.3em] text-gold mb-3 font-body">
        RSVP
      </p>
      <h1 className="font-heading text-3xl sm:text-4xl text-ink font-light mb-3">
        {reason === "deadline" ? "RSVP Closed" : "Guest Limit Reached"}
      </h1>
      <p className="text-xl text-clay mb-10 font-body">
        {reason === "deadline"
          ? "The RSVP deadline has passed."
          : "We\u2019ve reached our guest capacity."}
      </p>
      <p className="text-clay font-body">
        Please contact the couple directly if you need to make changes.
      </p>
    </div>
  );
}
