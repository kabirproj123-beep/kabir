/**
 * Push the scraped Maharashtra college dataset into Firestore.
 *
 *   node scripts/seed-firestore.mjs           # write colleges
 *   node scripts/seed-firestore.mjs --dry     # report only, write nothing
 *
 * Requires FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
 * in .env.local.
 *
 * Note on architecture: the site renders colleges from data/colleges.json, not
 * from Firestore. That keeps all 192 detail pages statically generated and the
 * site running with zero infrastructure. Seeding Firestore gives the client an
 * editable copy for the admin panel; re-export to JSON when you want edits to
 * go live. Leads are the opposite — always written to Firestore at runtime.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry");

// Minimal .env.local reader so the script needs no extra dependency.
function loadEnv() {
  try {
    const text = readFileSync(path.join(ROOT, ".env.local"), "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (!m) continue;
      const [, k, v] = m;
      if (!process.env[k]) process.env[k] = v.replace(/^["']|["']$/g, "");
    }
  } catch {
    /* no .env.local — rely on the ambient environment */
  }
}

loadEnv();

const colleges = JSON.parse(readFileSync(path.join(ROOT, "data", "colleges.json"), "utf8"));
console.log(`Loaded ${colleges.length} colleges from data/colleges.json`);

const byStream = colleges.reduce((acc, c) => {
  acc[c.stream] = (acc[c.stream] ?? 0) + 1;
  return acc;
}, {});
console.log("By stream:", byStream);

if (DRY) {
  console.log("\n--dry: nothing written.");
  process.exit(0);
}

const missing = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"].filter(
  (k) => !process.env[k],
);
if (missing.length) {
  console.error(`\nMissing credentials: ${missing.join(", ")}`);
  console.error("Fill them in .env.local (see .env.example), then re-run.");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

// Firestore caps a batch at 500 writes.
const CHUNK = 400;
let written = 0;

for (let i = 0; i < colleges.length; i += CHUNK) {
  const batch = db.batch();
  for (const c of colleges.slice(i, i + CHUNK)) {
    batch.set(db.collection("colleges").doc(c.slug), c);
  }
  await batch.commit();
  written += Math.min(CHUNK, colleges.length - i);
  console.log(`  committed ${written}/${colleges.length}`);
}

await db.collection("meta").doc("colleges").set({
  count: colleges.length,
  byStream,
  state: "Maharashtra",
  seededAt: new Date().toISOString(),
});

console.log(`\nDone. ${written} colleges written to Firestore.`);
process.exit(0);
