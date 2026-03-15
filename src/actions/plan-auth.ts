"use server";

import { createHash, createHmac, randomBytes } from "crypto";
import { cookies, headers } from "next/headers";
import { getDb } from "@/db";
import { weddingSettings, passkeyCredentials } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/server";

// ── Helpers ──────────────────────────────────────────────────────────

function hashPin(pin: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(salt + pin)
    .digest("hex");
  return `${salt}:${hash}`;
}

function verifyHash(pin: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const computed = createHash("sha256")
    .update(salt + pin)
    .digest("hex");
  return computed === hash;
}

function generateSessionToken(secret: string): string {
  return createHmac("sha256", secret).update("plan_session").digest("hex");
}

async function setSessionCookie(planPasscode: string) {
  const token = generateSessionToken(planPasscode);
  const cookieStore = await cookies();
  cookieStore.set("plan_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/plan",
    maxAge: 30 * 24 * 60 * 60,
  });
}

async function getRpConfig() {
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const rpID = host.split(":")[0];
  const origin = `${proto}://${host}`;
  return { rpID, origin };
}

// ── PIN Actions ──────────────────────────────────────────────────────

export async function verifyPin(
  pin: string
): Promise<{ success: boolean }> {
  const db = getDb();
  const [settings] = await db.select().from(weddingSettings).limit(1);
  if (!settings?.planPasscode) return { success: false };
  if (!verifyHash(pin, settings.planPasscode)) return { success: false };
  await setSessionCookie(settings.planPasscode);
  return { success: true };
}

export async function setPin(
  currentPin: string | null,
  newPin: string
): Promise<{ success: boolean; error?: string }> {
  if (!/^\d{4,8}$/.test(newPin)) {
    return { success: false, error: "PIN must be 4–8 digits" };
  }

  const db = getDb();
  const [settings] = await db.select().from(weddingSettings).limit(1);

  if (settings?.planPasscode) {
    if (!currentPin || !verifyHash(currentPin, settings.planPasscode)) {
      return { success: false, error: "Current PIN is incorrect" };
    }
  }

  const hashed = hashPin(newPin);

  if (settings) {
    await db
      .update(weddingSettings)
      .set({ planPasscode: hashed, updatedAt: new Date() })
      .where(eq(weddingSettings.id, settings.id));
  } else {
    await db.insert(weddingSettings).values({ planPasscode: hashed });
  }

  await setSessionCookie(hashed);
  // Don't revalidate the layout here — the cookie hasn't reached the
  // client yet, so the layout would see the PIN but no cookie and
  // immediately show the lock screen.  Client-side state handles
  // the settings UI update; the lock takes effect on next navigation.
  return { success: true };
}

export async function removePin(
  currentPin: string
): Promise<{ success: boolean; error?: string }> {
  const db = getDb();
  const [settings] = await db.select().from(weddingSettings).limit(1);
  if (!settings?.planPasscode) return { success: true };
  if (!verifyHash(currentPin, settings.planPasscode)) {
    return { success: false, error: "Current PIN is incorrect" };
  }

  await db
    .update(weddingSettings)
    .set({ planPasscode: "", updatedAt: new Date() })
    .where(eq(weddingSettings.id, settings.id));

  const cookieStore = await cookies();
  cookieStore.set("plan_session", "", {
    httpOnly: true,
    path: "/plan",
    maxAge: 0,
  });

  // Also remove all passkeys since they depend on having a PIN
  await db.delete(passkeyCredentials);

  revalidatePath("/plan", "layout");
  return { success: true };
}

// ── Passkey Actions ──────────────────────────────────────────────────

export async function getPasskeyRegistrationOptions() {
  const db = getDb();
  const existing = await db.select().from(passkeyCredentials);
  const { rpID } = await getRpConfig();

  const options = await generateRegistrationOptions({
    rpName: "Wedding Planner",
    rpID,
    userName: "Wedding Planner",
    userID: new TextEncoder().encode("wedding-planner"),
    attestationType: "none",
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      residentKey: "preferred",
      userVerification: "preferred",
    },
    excludeCredentials: existing.map((c) => ({
      id: c.id,
      transports: JSON.parse(c.transports || "[]"),
    })),
  });

  const cookieStore = await cookies();
  cookieStore.set("webauthn_challenge", options.challenge, {
    httpOnly: true,
    maxAge: 300,
    path: "/plan",
  });

  return options;
}

export async function completePasskeyRegistration(
  response: RegistrationResponseJSON
): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const challenge = cookieStore.get("webauthn_challenge")?.value;
  if (!challenge) return { success: false, error: "Challenge expired" };

  const { rpID, origin } = await getRpConfig();

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });

  cookieStore.delete("webauthn_challenge");

  if (!verification.verified || !verification.registrationInfo) {
    return { success: false, error: "Verification failed" };
  }

  const { credential } = verification.registrationInfo;
  const db = getDb();
  await db.insert(passkeyCredentials).values({
    id: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString("base64url"),
    counter: credential.counter,
    transports: JSON.stringify(response.response.transports || []),
  });

  revalidatePath("/plan", "layout");
  return { success: true };
}

export async function getPasskeyAuthOptions() {
  const db = getDb();
  const creds = await db.select().from(passkeyCredentials);
  if (creds.length === 0) return null;

  const { rpID } = await getRpConfig();

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: creds.map((c) => ({
      id: c.id,
      transports: JSON.parse(c.transports || "[]"),
    })),
    userVerification: "preferred",
  });

  const cookieStore = await cookies();
  cookieStore.set("webauthn_challenge", options.challenge, {
    httpOnly: true,
    maxAge: 300,
    path: "/plan",
  });

  return options;
}

export async function completePasskeyAuth(
  response: AuthenticationResponseJSON
): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  const challenge = cookieStore.get("webauthn_challenge")?.value;
  if (!challenge) return { success: false };

  const db = getDb();
  const [credential] = await db
    .select()
    .from(passkeyCredentials)
    .where(eq(passkeyCredentials.id, response.id));
  if (!credential) return { success: false };

  const { rpID, origin } = await getRpConfig();

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: credential.id,
      publicKey: Buffer.from(credential.publicKey, "base64url"),
      counter: credential.counter,
    },
  });

  cookieStore.delete("webauthn_challenge");

  if (!verification.verified) return { success: false };

  // Update counter
  await db
    .update(passkeyCredentials)
    .set({ counter: verification.authenticationInfo.newCounter })
    .where(eq(passkeyCredentials.id, credential.id));

  // Set session cookie — need the PIN hash for token derivation
  const [settings] = await db.select().from(weddingSettings).limit(1);
  if (settings?.planPasscode) {
    await setSessionCookie(settings.planPasscode);
  }

  return { success: true };
}

export async function removePasskey(
  id: string
): Promise<{ success: boolean }> {
  const db = getDb();
  await db.delete(passkeyCredentials).where(eq(passkeyCredentials.id, id));
  revalidatePath("/plan", "layout");
  return { success: true };
}
