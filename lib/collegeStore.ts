/**
 * College data access — Firestore is the source of truth.
 *
 * Documents live in the `colleges` collection, keyed by slug. The catalogue is
 * already loaded there; the admin panel at /admin/colleges is the way records
 * change.
 *
 * The bundled JSON stays as a fallback for two cases only: no Firebase
 * credentials (a fresh checkout, or a preview build), and an empty collection
 * (credentials present but not seeded yet). Both render the site rather than
 * showing an empty catalogue — but neither is editable, and the admin panel
 * says so.
 *
 * Reads are cached across requests and invalidated by tag, so a page render
 * doesn't pull 190 documents every time. Every mutation calls
 * `updateTag(COLLEGES_TAG)`, which gives the admin read-your-own-writes — the
 * page they land on after saving shows the edit, not a stale copy. That does
 * mean mutations must be called from a Server Action; nothing else may.
 */
import "server-only";
import { unstable_cache, updateTag } from "next/cache";
import { getAdminDb } from "./firebaseAdmin";
import seedJson from "@/data/colleges.json";
import {
  citiesIn,
  countByStreamIn,
  normaliseCollege,
  relatedIn,
  selectColleges,
  slugify,
  topInStream,
  type College,
  type Filters,
  type Stream,
} from "./colleges";

export const COLLECTION = "colleges";
export const COLLEGES_TAG = "colleges";

/** How long a cached read survives without an explicit invalidation. */
const TTL_SECONDS = 300;

export type Source = "firestore" | "bundled";
export type Result<T = void> = { ok: true; value: T } | { ok: false; error: string };

const bundled: College[] = (seedJson as unknown[]).map(normaliseCollege);

/* --------------------------------- reads -------------------------------- */

async function read(): Promise<{ colleges: College[]; source: Source }> {
  const db = getAdminDb();
  if (!db) return { colleges: bundled, source: "bundled" };

  try {
    const snap = await db.collection(COLLECTION).get();
    // An empty collection means "not seeded", not "no colleges" — showing the
    // bundled list beats showing an empty site.
    if (snap.empty) return { colleges: bundled, source: "bundled" };
    return { colleges: snap.docs.map((d) => normaliseCollege(d.data())), source: "firestore" };
  } catch (err) {
    console.error("Firestore college read failed; using bundled data:", err);
    return { colleges: bundled, source: "bundled" };
  }
}

const cachedRead = unstable_cache(read, ["colleges:all"], {
  tags: [COLLEGES_TAG],
  revalidate: TTL_SECONDS,
});

export async function getAllColleges(): Promise<College[]> {
  return (await cachedRead()).colleges;
}

/** Which store the current list came from — surfaced in the admin panel. */
export async function collegesSource(): Promise<Source> {
  return (await cachedRead()).source;
}

export async function getCollege(slug: string): Promise<College | undefined> {
  return (await getAllColleges()).find((c) => c.slug === slug);
}

export async function getCities(): Promise<string[]> {
  return citiesIn(await getAllColleges());
}

export async function countByStream(): Promise<Record<string, number>> {
  return countByStreamIn(await getAllColleges());
}

export async function filterColleges(f: Filters): Promise<College[]> {
  return selectColleges(await getAllColleges(), f);
}

export async function topByStream(stream: Stream, limit = 10): Promise<College[]> {
  return topInStream(await getAllColleges(), stream, limit);
}

export async function relatedColleges(c: College, limit = 6): Promise<College[]> {
  return relatedIn(await getAllColleges(), c, limit);
}

/* ------------------------------- mutations ------------------------------ */

/**
 * Firestore rejects `undefined` values outright, and the College type uses
 * `undefined` for absent optional fields. Drop them rather than storing nulls,
 * which would change how `fee_source` reads back.
 */
function forFirestore(c: College): Record<string, unknown> {
  return Object.fromEntries(Object.entries(c).filter(([, v]) => v !== undefined));
}

/**
 * Create or replace a college. `previousSlug` is the slug the form was opened
 * with: when the admin renames a college its slug changes, and the old document
 * has to go or the site shows both.
 */
export async function saveCollege(
  input: unknown,
  opts: { previousSlug?: string; by?: string } = {},
): Promise<Result<College>> {
  const db = getAdminDb();
  if (!db) {
    return {
      ok: false,
      error:
        "Firebase is not configured, so colleges can't be edited. Set the FIREBASE_* variables " +
        "in .env.local and restart the server.",
    };
  }

  const college = normaliseCollege(input);
  if (!college.name.trim() || college.name === "Untitled college") {
    return { ok: false, error: "A college needs a name." };
  }
  if (!college.slug) {
    return { ok: false, error: "Couldn't build a URL slug from that name — add one manually." };
  }

  const previous = opts.previousSlug ? slugify(opts.previousSlug) : null;

  // Renaming onto an existing slug would silently overwrite that college.
  if (college.slug !== previous) {
    const clash = await db.collection(COLLECTION).doc(college.slug).get();
    if (clash.exists) {
      return { ok: false, error: `A college already uses the URL "/colleges/${college.slug}".` };
    }
  }

  const record: College = {
    ...college,
    updatedAt: new Date().toISOString(),
    updatedBy: opts.by ?? "admin",
  };

  await db.collection(COLLECTION).doc(record.slug).set(forFirestore(record));
  if (previous && previous !== record.slug) {
    await db.collection(COLLECTION).doc(previous).delete();
  }

  updateTag(COLLEGES_TAG);
  return { ok: true, value: record };
}

export async function deleteCollege(slug: string): Promise<Result> {
  const db = getAdminDb();
  if (!db) return { ok: false, error: "Firebase is not configured." };

  const id = slugify(slug);
  if (!id) return { ok: false, error: "No such college." };

  await db.collection(COLLECTION).doc(id).delete();
  updateTag(COLLEGES_TAG);
  return { ok: true, value: undefined };
}
