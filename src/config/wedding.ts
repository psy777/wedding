const env = (key: string, fallback = ""): string =>
  process.env[key] ?? fallback;

export const WEDDING = {
  couple: {
    partner1: env("NEXT_PUBLIC_PARTNER1", "Partner One"),
    partner2: env("NEXT_PUBLIC_PARTNER2", "Partner Two"),
  },
  date: {
    full: env("NEXT_PUBLIC_DATE_FULL", "Saturday, January 1st, 2027"),
    short: env("NEXT_PUBLIC_DATE_SHORT", "January 1, 2027"),
    iso: env("NEXT_PUBLIC_DATE_ISO", "2027-01-01"),
  },
  time: {
    ceremony: env("NEXT_PUBLIC_TIME_CEREMONY", "4:00 PM"),
    reception: env("NEXT_PUBLIC_TIME_RECEPTION", "5:30 PM"),
  },
  venue: {
    name: env("NEXT_PUBLIC_VENUE_NAME", "Venue Name"),
    address: env("NEXT_PUBLIC_VENUE_ADDRESS", "123 Venue St"),
    city: env("NEXT_PUBLIC_VENUE_CITY", "City"),
    state: env("NEXT_PUBLIC_VENUE_STATE", "ST"),
    zip: env("NEXT_PUBLIC_VENUE_ZIP", "00000"),
    mapUrl: env("NEXT_PUBLIC_VENUE_MAP_URL", "#"),
  },
  dressCode: env("NEXT_PUBLIC_DRESS_CODE", "Semi-formal / Cocktail Attire"),
  rsvpDeadline: {
    display: env("NEXT_PUBLIC_RSVP_DEADLINE_DISPLAY", "December 1, 2026"),
    iso: env("NEXT_PUBLIC_RSVP_DEADLINE_ISO", "2026-12-01T23:59:59Z"),
  },
  travel: {
    hotels: [
      {
        name: env("NEXT_PUBLIC_HOTEL1_NAME"),
        address: env("NEXT_PUBLIC_HOTEL1_ADDRESS"),
        phone: env("NEXT_PUBLIC_HOTEL1_PHONE"),
        notes: env("NEXT_PUBLIC_HOTEL1_NOTES"),
        bookingUrl: env("NEXT_PUBLIC_HOTEL1_BOOKING_URL", "#"),
      },
      {
        name: env("NEXT_PUBLIC_HOTEL2_NAME"),
        address: env("NEXT_PUBLIC_HOTEL2_ADDRESS"),
        phone: env("NEXT_PUBLIC_HOTEL2_PHONE"),
        notes: env("NEXT_PUBLIC_HOTEL2_NOTES"),
        bookingUrl: env("NEXT_PUBLIC_HOTEL2_BOOKING_URL", "#"),
      },
    ],
    parking: env("NEXT_PUBLIC_PARKING_INFO", "Parking details coming soon."),
    directions: env("NEXT_PUBLIC_DIRECTIONS", "Directions coming soon."),
  },
  tos: `TERMS & CONDITIONS OF ATTENDANCE

By submitting your RSVP, you acknowledge and agree to the following:

1. PHOTO & VIDEO CONSENT
You consent to being photographed and recorded during the event. These images may be used by the couple for personal keepsakes and social media.

2. ASSUMPTION OF RISK
You attend the event at your own risk. The couple and venue are not liable for any injury, illness, or loss of personal property during the event.

3. GUEST CONDUCT
All guests are expected to behave respectfully. The couple reserves the right to ask any guest to leave if their behavior is disruptive or inappropriate.

4. CHILDREN
Children are welcome only where indicated on your invitation. Please respect the number of children slots allocated to your household.

5. DIETARY ACCOMMODATIONS
While we will make reasonable efforts to accommodate dietary restrictions noted in your RSVP, we cannot guarantee a completely allergen-free environment.

6. RSVP CHANGES
If your plans change after submitting your RSVP, please update your response as soon as possible before the deadline. After the deadline, changes may not be accommodated.

7. PRIVACY
Your personal information (name, address, phone) is collected solely for wedding planning purposes and will not be shared with third parties.

8. EVENT MODIFICATIONS
The couple reserves the right to modify event details (time, location, schedule) and will communicate any changes to confirmed guests.

By checking the box below, you confirm that you have read, understood, and agree to these terms on behalf of yourself and all members of your household listed in this RSVP.`,
};
