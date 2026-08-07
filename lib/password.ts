import "server-only";
import { scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";
import { promisify } from "node:util";

/**
 * Admin passwords are stored as typed, so the Team page can show them — see
 * lib/adminUsers.ts. Nothing here hashes.
 *
 * Accounts created while hashing was in force still hold an scrypt digest, and
 * a digest can't be turned back into a password. `verifyPassword` keeps those
 * sign-ins working; `authenticate` then replaces the digest with the password
 * that just succeeded, so the account becomes readable like the rest.
 */

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>;

const MAXMEM = 64 * 1024 * 1024;

/** `scrypt:N:r:p:salt:key` — the only format this ever produced. */
export function isHashed(stored: string): boolean {
  return stored.startsWith("scrypt:");
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  if (!isHashed(stored)) return stored.length > 0 && stored === plain;

  const [, n, r, p, salt, key] = stored.split(":");
  const expected = Buffer.from(key, "base64");
  const actual = await scrypt(plain, Buffer.from(salt, "base64"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: MAXMEM,
  });

  return timingSafeEqual(actual, expected);
}
