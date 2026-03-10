import { NextRequest, NextResponse } from "next/server";
import { lookupHousehold } from "@/lib/google-sheets";
import { LookupResponse } from "@/lib/types";

// Simple in-memory rate limiter
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  record.count++;
  return record.count > 5;
}

export async function POST(request: NextRequest): Promise<NextResponse<LookupResponse>> {
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const code = (body.code || "").trim();

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Please enter your household code." },
        { status: 400 }
      );
    }

    const household = await lookupHousehold(code);

    if (!household) {
      return NextResponse.json(
        { success: false, error: "We couldn't find that code. Please check your invitation and try again." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: household,
      alreadySubmitted: !!household.submittedAt,
    });
  } catch (error) {
    console.error("Lookup error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
