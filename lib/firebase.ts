/**
 * Firebase client SDK (browser).
 *
 * Config comes from NEXT_PUBLIC_* env vars so it can differ per environment.
 * These values are NOT secret — the web config is safe to ship. The admin
 * service-account key is the sensitive one and lives server-side only
 * (see lib/firebaseAdmin.ts) and is gitignored.
 *
 * If the env vars aren't set (as in this draft), `db` is null and the site
 * simply uses the local defaults in lib/content.ts.
 */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const configured = Boolean(config.apiKey && config.projectId);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (configured) {
  app = getApps()[0] ?? initializeApp(config);
  db = getFirestore(app);
}

export { app, db, configured as firebaseConfigured };
