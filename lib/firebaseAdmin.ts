/**
 * Firebase Admin SDK (server only).
 *
 * Reads service-account credentials from env. NEVER import this in a client
 * component — it holds privileged access.
 *
 * Deliberately lazy and nullable: the site must render (and take leads) before
 * the client has provisioned Firebase. Call `getAdminDb()` and handle `null`
 * rather than importing a Firestore instance at module scope, which would throw
 * at build time on a machine with no credentials.
 */
import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let cached: Firestore | null | undefined;

/** True only when a Firestore handle can actually be built. */
export function isFirebaseConfigured(): boolean {
  return getAdminDb() !== null;
}

function hasCredentialEnv(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
  );
}

/**
 * Put a PEM key back together however the dashboard mangled it. Pasting a
 * service-account key into a hosting UI reliably produces one of: literal `\n`
 * two-character escapes, wrapping quotes that become part of the value, `\r\n`,
 * or the whole key base64-encoded to dodge newlines entirely.
 */
function normalisePrivateKey(raw: string): string {
  let key = raw.trim();

  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  // A key that arrived base64-encoded has no PEM header until it's decoded.
  if (!key.includes("BEGIN")) {
    try {
      const decoded = Buffer.from(key, "base64").toString("utf8");
      if (decoded.includes("BEGIN")) key = decoded;
    } catch {
      /* not base64 — fall through and let cert() report it */
    }
  }

  return key.replace(/\\r/g, "").replace(/\\n/g, "\n").replace(/\r/g, "");
}

/** Returns a Firestore handle, or null when credentials are absent. */
export function getAdminDb(): Firestore | null {
  if (cached !== undefined) return cached;

  if (!hasCredentialEnv()) {
    console.error(
      "[firebase] FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must all " +
        "be set. Admin sign-in and lead capture need them.",
    );
    cached = null;
    return cached;
  }

  try {
    const app: App = getApps().length
      ? getApps()[0]!
      : initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID?.trim(),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.trim(),
            privateKey: normalisePrivateKey(process.env.FIREBASE_PRIVATE_KEY!),
          }),
        });
    cached = getFirestore(app);
  } catch (err) {
    // Almost always a mangled FIREBASE_PRIVATE_KEY: it must keep its literal
    // \n escapes, header and footer lines included.
    console.error("[firebase] Could not initialise the Admin SDK:", err);
    cached = null;
  }
  return cached;
}
