/**
 * College data access.
 *
 * The dataset in `data/colleges.json` is scraped and normalised (see
 * scripts/README-data.md). It ships with the repo so the site renders with zero
 * infrastructure; Firestore is layered on top for admin edits, not required.
 *
 * Scope: Maharashtra only — every record has state === "Maharashtra".
 */
import raw from "@/data/colleges.json";

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
};

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

const colleges = raw as unknown as College[];

export function getAllColleges(): College[] {
  return colleges;
}

export function getCollege(slug: string): College | undefined {
  return colleges.find((c) => c.slug === slug);
}

export function getCities(): string[] {
  const set = new Set<string>();
  for (const c of colleges) if (c.city) set.add(c.city);
  return [...set].sort();
}

export function countByStream(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of colleges) out[c.stream] = (out[c.stream] ?? 0) + 1;
  return out;
}

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

export function filterColleges(f: Filters): College[] {
  let out = colleges;

  if (f.stream && f.stream !== "All") out = out.filter((c) => c.stream === f.stream);
  if (f.city && f.city !== "All") out = out.filter((c) => c.city === f.city);
  if (f.ownership && f.ownership !== "All") {
    out = out.filter((c) => c.ownership === f.ownership);
  }
  if (typeof f.maxFee === "number") {
    out = out.filter((c) => c.total_fee_value !== null && c.total_fee_value <= f.maxFee!);
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
  return [...out].sort((a, b) => {
    switch (sort) {
      case "fee-low":
        return (a.total_fee_value ?? LAST) - (b.total_fee_value ?? LAST);
      case "fee-high":
        return (b.total_fee_value ?? -1) - (a.total_fee_value ?? -1);
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
export function topByStream(stream: Stream, limit = 10): College[] {
  return filterColleges({ stream, sort: "rank" }).slice(0, limit);
}

/** Similar colleges shown on a detail page: same stream, prefer same city. */
export function relatedColleges(c: College, limit = 6): College[] {
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
