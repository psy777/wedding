import { NextRequest, NextResponse } from "next/server";

interface SmartyCandidate {
  delivery_line_1: string;
  last_line: string;
  components: {
    primary_number: string;
    street_predirection: string;
    street_name: string;
    street_suffix: string;
    street_postdirection: string;
    secondary_number: string;
    secondary_designator: string;
    city_name: string;
    default_city_name: string;
    state_abbreviation: string;
    zipcode: string;
    plus4_code: string;
  };
  analysis: {
    dpv_match_code: string; // Y=confirmed, S=secondary missing, D=default, N=not confirmed
    dpv_footnotes: string;
    active: string; // Y or N
  };
}

export interface ValidateResponse {
  valid: boolean;
  suggested?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  original: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<ValidateResponse>> {
  const { street, city, state, zip } = await request.json();

  const authId = process.env.SMARTY_AUTH_ID;
  const authToken = process.env.SMARTY_AUTH_TOKEN;

  const original = { street, city, state, zip };

  // If Smarty isn't configured, skip validation
  if (!authId || !authToken) {
    return NextResponse.json({ valid: true, original });
  }

  try {
    const params = new URLSearchParams({
      "auth-id": authId,
      "auth-token": authToken,
      street: street,
      city: city,
      state: state,
      zipcode: zip,
      candidates: "1",
    });

    const res = await fetch(
      `https://us-street.api.smarty.com/street-address?${params.toString()}`,
      { method: "GET" }
    );

    if (!res.ok) {
      // API error — don't block submission
      return NextResponse.json({ valid: true, original });
    }

    const candidates: SmartyCandidate[] = await res.json();

    if (candidates.length === 0) {
      return NextResponse.json({ valid: false, original });
    }

    const match = candidates[0];
    const c = match.components;

    const suggested = {
      street: match.delivery_line_1,
      city: c.default_city_name || c.city_name,
      state: c.state_abbreviation,
      zip: c.plus4_code ? `${c.zipcode}-${c.plus4_code}` : c.zipcode,
    };

    // Check if the suggested address differs from original
    const isDifferent =
      suggested.street.toLowerCase() !== street.trim().toLowerCase() ||
      suggested.city.toLowerCase() !== city.trim().toLowerCase() ||
      suggested.state.toLowerCase() !== state.trim().toLowerCase() ||
      !zip.trim().startsWith(c.zipcode);

    return NextResponse.json({
      valid: true,
      suggested: isDifferent ? suggested : undefined,
      original,
    });
  } catch {
    // Network error — don't block submission
    return NextResponse.json({ valid: true, original });
  }
}
