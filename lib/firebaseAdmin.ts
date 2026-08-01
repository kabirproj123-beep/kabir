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

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
  );
}

/** Returns a Firestore handle, or null when credentials are absent. */
export function getAdminDb(): Firestore | null {
  if (cached !== undefined) return cached;

  if (!isFirebaseConfigured()) {
    cached = null;
    return cached;
  }

  try {
    const app: App = getApps().length
      ? getApps()[0]!
      : initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Vercel/CI store the key with escaped newlines; restore them.
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          }),
        });
    cached = getFirestore(app);
  } catch (err) {
    console.error("Firebase admin init failed; falling back to local store:", err);
    cached = null;
  }
  return cached;
}
