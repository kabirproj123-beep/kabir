/**
 * Lead types and constants, free of I/O.
 *
 * The same split lib/colleges.ts makes: lib/leads.ts is `server-only` and pulls
 * in firebase-admin, so anything a client component needs to *import as a
 * value* — the status list a filter renders, the source list a form validates
 * against — has to live somewhere it can reach. Types alone would be fine to
 * import from lib/leads (they erase), but `LEAD_STATUSES` is a real array and
 * importing it from there drags the Admin SDK into the browser bundle.
 *
 * lib/leads.ts re-exports all of this, so server code has one import as before.
 */

export const LEAD_SOURCES = [
  "compare-unlock",
  "loan-calculator",
  "counselling",
  "college-enquiry",
  "newsletter",
  "contact",
  "enquiry",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_STATUSES = ["new", "contacted", "converted", "closed"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  course: string | null;
  /** Free-form extras per source — income band, compared colleges, message. */
  meta: Record<string, string>;
  source: LeadSource;
  collegeSlug: string | null;
  status: LeadStatus;
  createdAt: string; // ISO 8601
};

export type NewLead = Omit<Lead, "id" | "createdAt" | "status">;
