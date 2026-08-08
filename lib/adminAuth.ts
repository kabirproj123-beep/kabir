/**
 * Admin sessions — documents in the Firestore `admin_sessions` collection.
 *
 * Login issues a random token, stored in an httpOnly cookie. Firestore holds
 * only its SHA-256, so a database dump can't be replayed as a login. Records
 * rather than signed cookies means no signing secret in env, and signing
 * someone out is a delete.
 */
import "server-only";
import { cache } from "react";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getAdminDb } from "./firebaseAdmin";
import { NOT_CONFIGURED, getAdmin, isFirebaseConfigured, type AdminSummary } from "./adminUsers";

export const ADMIN_COOKIE = "kabir_admin";

const TTL_HOURS = 12;

type Session = { username: string; expiresAt: string };

/** The cookie value is the secret; Firestore only sees this digest. */
function tokenId(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function sessions() {
  const db = getAdminDb();
  if (!db) throw new Error(NOT_CONFIGURED);
  return db.collection("admin_sessions");
}

/** Cookies can only be set from a Server Action or Route Handler. */
export async function startSession(username: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TTL_HOURS * 3600_000);

  await sessions().doc(tokenId(token)).set({ username, expiresAt: expiresAt.toISOString() });

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (token) await sessions().doc(tokenId(token)).delete();
  jar.delete(ADMIN_COOKIE);
}

/**
 * The signed-in admin, or null. Memoised per render so a page doesn't repeat
 * the lookup. Re-reads the account each time, so removing someone locks them
 * out immediately rather than in 12 hours.
 */
export const currentAdmin = cache(async (): Promise<AdminSummary | null> => {
  if (!isFirebaseConfigured()) return null;

  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  try {
    const snap = await sessions().doc(tokenId(token)).get();
    if (!snap.exists) return null;

    const { username, expiresAt } = snap.data() as Session;
    if (Date.parse(expiresAt) <= Date.now()) {
      await snap.ref.delete().catch(() => {});
      return null;
    }
    return getAdmin(username);
  } catch (err) {
    // Credentials that load but can't read: the service account is missing the
    // Firestore role, points at another project, or the API is disabled. Read
    // as signed-out so the panel redirects to a page that explains itself,
    // instead of throwing through the render as an opaque digest.
    console.error("[admin] Could not read the session from Firestore:", err);
    return null;
  }
});

/**
 * Guard for Server Actions, which accept a direct POST no matter what the page
 * rendered. Throws rather than redirecting so a forged request fails loudly.
 */
export async function requireAdmin(): Promise<AdminSummary> {
  const admin = await currentAdmin();
  if (!admin) throw new Error("Unauthorized");
  return admin;
}
