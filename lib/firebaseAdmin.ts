/**
 * Firebase Admin SDK (server only).
 *
 * Reads the service-account credentials from env. NEVER import this in a
 * client component — it holds privileged access.
 *
 * Set these in .env.local (see .env.example). The private key is gitignored
 * and must never be committed.
 */
import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App | undefined;

function getAdminApp(): App {
  if (getApps().length) return getApps()[0]!;
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Vercel/CI store the key with escaped newlines; restore them.
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
  return app;
}

export const adminDb: Firestore = getFirestore(getAdminApp());
