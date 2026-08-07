/**
 * College types, formatting and the pure filter/sort logic.
 *
 * This module is deliberately free of I/O so client components can import the
 * `College` type and the formatters without pulling in firebase-admin. Every
 * function here takes the college list as an argument; the list itself comes
 * from `lib/collegeStore.ts` (server only), which reads Firestore.
 *
 * Scope: Maharashtra only — every record has state === "Maharashtra".
 */

export type Course = {
  name: string;
  duration: string | null;
  mode: string | null;
  total_fee: string | null;
  eligibility: string | null;
  popular: boolean;
};

export type SelectionStep = { title: string; body: string };
export type Faq = { q: string; a: string };

export type College = {
  slug: string;
  name: string;
  short_name: string;
  city: string | null;
  state: string;
  stream: Stream;
  ownership: string | null;
  type: string | null;
  nirf_rank: number | null;
  total_fee: string | null;
  total_fee_value: number | null;
  avg_ctc: string | null;
  avg_ctc_value: number | null;
  highest_package: string | null;
  highest_package_value: number | null;
  placement_rate: number | null;
  placement_year: string | null;
  total_offers: string | null;
  tagline: string | null;
  overview: string | null;
  why_choose: string | null;
  admission_process: string | null;
  campus_life: string | null;
  founded: string | null;
  affiliation: string | null;
  approved_by: string | null;
  naac_grade: string | null;
  campus_size: string | null;
  student_count: string | null;
  faculty_count: string | null;
  entrance_exams: string[];
  facilities: string[];
  selection_steps: SelectionStep[];
  courses: Course[];
  faqs: Faq[];
  rating: number | null;
  reviews: number;
  source: string;
  /**
   * Whether the fee figure has been cross-checked against a second source that
   * states which course it covers.
   *
   * The original scrape mixed annual and total fees without labelling them and
   * was wildly wrong in places — COEP was out by 8.8x, Mumbai University by 41x.
   * Only "high" figures are safe to show as a number; "low" ones are withheld.
   */
  fee_confidence?: "high" | "low";
  /** Which programme the verified fee is for, e.g. "B.Tech Computer Science". */
  fee_course?: string | null;
  fee_source?: string;
  /** Set by the admin panel on every save. Absent on seeded records. */
  updatedAt?: string;
  updatedBy?: string;
};

/** True when the fee can be shown as a figure rather than "on request". */
export function hasVerifiedFee(c: College): boolean {
  return c.fee_confidence === "high" && c.total_fee_value !== null;
}

export const STREAMS = [
  "Engineering",
  "Management",
  "Medical",
  "Law",
  "Pharmacy",
  "Dental",
  "Architecture",
] as const;
export type Stream = (typeof STREAMS)[number];

/** The four verticals the client leads with. */
export const PRIMARY_STREAMS: Stream[] = ["Engineering", "Medical", "Management", "Law"];

export type Sort = "rank" | "fee-low" | "fee-high" | "ctc" | "name";

export type Filters = {
  stream?: string;
  city?: string;
  ownership?: string;
  q?: string;
  maxFee?: number;
  sort?: Sort;
};

/**
 * Rank ordering has to cope with a lot of missing data: many colleges have no
 * NIRF rank, no CTC, or no fee. Missing values always sort last rather than
 * sorting as zero, which would otherwise float unranked colleges to the top.
 */
const LAST = Number.MAX_SAFE_INTEGER;

/* ---------------------------------------------------------------------- */
/* Pure list operations — the store wraps each of these with a fetch.      */
/* ---------------------------------------------------------------------- */

export function citiesIn(colleges: College[]): string[] {
  const set = new Set<string>();
  for (const c of colleges) if (c.city) set.add(c.city);
  return [...set].sort();
}

export function countByStreamIn(colleges: College[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of colleges) out[c.stream] = (out[c.stream] ?? 0) + 1;
  return out;
}

export function selectColleges(colleges: College[], f: Filters): College[] {
  let out = colleges;

  if (f.stream && f.stream !== "All") out = out.filter((c) => c.stream === f.stream);
  if (f.city && f.city !== "All") out = out.filter((c) => c.city === f.city);
  if (f.ownership && f.ownership !== "All") {
    out = out.filter((c) => c.ownership === f.ownership);
  }
  if (typeof f.maxFee === "number") {
    // Only filter on fees we actually trust — an unverified figure could be out
    // by several multiples and would silently exclude the wrong colleges.
    out = out.filter((c) => hasVerifiedFee(c) && c.total_fee_value! <= f.maxFee!);
  }
  if (f.q) {
    const q = f.q.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.short_name.toLowerCase().includes(q) ||
          (c.city ?? "").toLowerCase().includes(q) ||
          c.stream.toLowerCase().includes(q),
      );
    }
  }

  const sort = f.sort ?? "rank";
  // Unverified fees must not participate in fee ordering, or a college whose
  // real fee is 8x the stored one appears at the top of "cheapest first".
  const fee = (c: College) => (hasVerifiedFee(c) ? c.total_fee_value! : null);
  return [...out].sort((a, b) => {
    switch (sort) {
      case "fee-low":
        return (fee(a) ?? LAST) - (fee(b) ?? LAST);
      case "fee-high":
        return (fee(b) ?? -1) - (fee(a) ?? -1);
      case "ctc":
        return (b.avg_ctc_value ?? -1) - (a.avg_ctc_value ?? -1);
      case "name":
        return a.name.localeCompare(b.name);
      case "rank":
      default: {
        const ar = a.nirf_rank || LAST;
        const br = b.nirf_rank || LAST;
        if (ar !== br) return ar - br;
        // Tie-break unranked colleges by placement strength, then name.
        const ac = a.avg_ctc_value ?? -1;
        const bc = b.avg_ctc_value ?? -1;
        if (ac !== bc) return bc - ac;
        return a.name.localeCompare(b.name);
      }
    }
  });
}

/** Top colleges for a stream — used by the homepage rails and /rankings. */
export function topInStream(colleges: College[], stream: Stream, limit = 10): College[] {
  return selectColleges(colleges, { stream, sort: "rank" }).slice(0, limit);
}

/** Similar colleges shown on a detail page: same stream, prefer same city. */
export function relatedIn(colleges: College[], c: College, limit = 6): College[] {
  const pool = colleges.filter((x) => x.slug !== c.slug && x.stream === c.stream);
  const sameCity = pool.filter((x) => x.city === c.city);
  const rest = pool.filter((x) => x.city !== c.city);
  const rank = (x: College) => x.nirf_rank || LAST;
  return [...sameCity.sort((a, b) => rank(a) - rank(b)), ...rest.sort((a, b) => rank(a) - rank(b))].slice(
    0,
    limit,
  );
}

/* ---------------------------------------------------------------------- */
/* Normalisation — Firestore documents and admin form input both go        */
/* through here, so a missing field can never crash a page.                */
/* ---------------------------------------------------------------------- */

function str(v: unknown): string | null {
  const s = typeof v === "string" ? v.trim() : v === null || v === undefined ? "" : String(v);
  return s || null;
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function strList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x ?? "").trim()).filter(Boolean);
}

/** Slugs are Firestore document ids, so: lowercase, no slashes, no spaces. */
export function slugify(input: string): string {
  return String(input ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

export function normaliseCollege(raw: unknown): College {
  const r = (raw ?? {}) as Record<string, unknown>;
  const name = str(r.name) ?? "Untitled college";
  const stream = (STREAMS as readonly string[]).includes(String(r.stream))
    ? (r.stream as Stream)
    : "Engineering";

  return {
    slug: slugify(str(r.slug) ?? name),
    name,
    short_name: str(r.short_name) ?? name,
    city: str(r.city),
    state: str(r.state) ?? "Maharashtra",
    stream,
    ownership: str(r.ownership),
    type: str(r.type),
    nirf_rank: num(r.nirf_rank),
    total_fee: str(r.total_fee),
    total_fee_value: num(r.total_fee_value),
    avg_ctc: str(r.avg_ctc),
    avg_ctc_value: num(r.avg_ctc_value),
    highest_package: str(r.highest_package),
    highest_package_value: num(r.highest_package_value),
    placement_rate: num(r.placement_rate),
    placement_year: str(r.placement_year),
    total_offers: str(r.total_offers),
    tagline: str(r.tagline),
    overview: str(r.overview),
    why_choose: str(r.why_choose),
    admission_process: str(r.admission_process),
    campus_life: str(r.campus_life),
    founded: str(r.founded),
    affiliation: str(r.affiliation),
    approved_by: str(r.approved_by),
    naac_grade: str(r.naac_grade),
    campus_size: str(r.campus_size),
    student_count: str(r.student_count),
    faculty_count: str(r.faculty_count),
    entrance_exams: strList(r.entrance_exams),
    facilities: strList(r.facilities),
    selection_steps: (Array.isArray(r.selection_steps) ? r.selection_steps : [])
      .map((s) => {
        const o = (s ?? {}) as Record<string, unknown>;
        return { title: str(o.title) ?? "", body: str(o.body) ?? "" };
      })
      .filter((s) => s.title || s.body),
    courses: (Array.isArray(r.courses) ? r.courses : [])
      .map((s) => {
        const o = (s ?? {}) as Record<string, unknown>;
        return {
          name: str(o.name) ?? "",
          duration: str(o.duration),
          mode: str(o.mode),
          total_fee: str(o.total_fee),
          eligibility: str(o.eligibility),
          popular: Boolean(o.popular),
        };
      })
      .filter((c) => c.name),
    faqs: (Array.isArray(r.faqs) ? r.faqs : [])
      .map((s) => {
        const o = (s ?? {}) as Record<string, unknown>;
        return { q: str(o.q) ?? "", a: str(o.a) ?? "" };
      })
      .filter((f) => f.q || f.a),
    rating: num(r.rating),
    reviews: num(r.reviews) ?? 0,
    source: str(r.source) ?? "admin",
    fee_confidence: r.fee_confidence === "high" ? "high" : "low",
    fee_course: str(r.fee_course),
    fee_source: str(r.fee_source) ?? undefined,
    updatedAt: str(r.updatedAt) ?? undefined,
    updatedBy: str(r.updatedBy) ?? undefined,
  };
}

/** A blank record for the "add a college" form. */
export function emptyCollege(): College {
  return normaliseCollege({ name: "", stream: "Engineering", state: "Maharashtra", source: "admin" });
}

/* ---------------------------------------------------------------------- */
/* Formatting helpers — Indian numbering, used across cards and tables.    */
/* ---------------------------------------------------------------------- */

export function formatINR(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(2).replace(/\.00$/, "")} Cr`;
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(2).replace(/\.00$/, "")} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatLPA(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(2).replace(/\.00$/, "")} Cr`;
  return `₹${(value / 1_00_000).toFixed(2).replace(/\.00$/, "")} LPA`;
}
