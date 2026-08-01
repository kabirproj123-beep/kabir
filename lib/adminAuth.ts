/**
 * Admin gate.
 *
 * A single shared password (ADMIN_PASSWORD) exchanged for an HMAC-signed
 * cookie. This is deliberately small: the panel exposes leads, not money, and
 * the client wants one login. If per-user accounts are needed later, swap this
 * for Firebase Auth — the call sites only use `isAdmin()`.
 *
 * The cookie value is an HMAC of a fixed subject keyed by the password, so it
 * cannot be forged without knowing the password, and the password itself is
 * never stored in the browser.
 */
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "kabir_admin";
const SUBJECT = "admin-session-v1";

function secret(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  return pw && pw.length >= 8 ? pw : null;
}

export function isAdminConfigured(): boolean {
  return secret() !== null;
}

export function signToken(): string | null {
  const pw = secret();
  if (!pw) return null;
  return createHmac("sha256", pw).update(SUBJECT).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function verifyPassword(candidate: string): boolean {
  const pw = secret();
  if (!pw) return false;
  return safeEqual(candidate, pw);
}

/** `cookies()` is async in Next 16. */
export async function isAdmin(): Promise<boolean> {
  const expected = signToken();
  if (!expected) return false;
  const jar = await cookies();
  const got = jar.get(ADMIN_COOKIE)?.value;
  if (!got) return false;
  return safeEqual(got, expected);
}
