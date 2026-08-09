/**
 * Leads — the core of the business. Every gated tool on the site (comparison
 * unlock, loan calculator, counselling request, newsletter) funnels here, and
 * the admin panel at /admin reads it back.
 *
 * Storage: Firestore only. If Firebase is not configured, writes fail loudly
 * instead of silently falling back to a local JSON file.
 */
import "server-only";
import { getAdminDb, isFirebaseConfigured } from "./firebaseAdmin";

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

const COLLECTION = "leads";

/* ----------------------------- validation ------------------------------ */

/** Indian mobile numbers: 10 digits starting 6-9, tolerant of +91 / spaces. */
export function normalisePhone(input: string): string | null {
  const digits = (input || "").replace(/\D/g, "");
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  if (local.length !== 10) return null;
  if (!/^[6-9]/.test(local)) return null;
  return local;
}

export function validateLead(input: Partial<NewLead>): { ok: true; lead: NewLead } | { ok: false; error: string } {
  const name = (input.name ?? "").toString().trim();
  if (name.length < 2) return { ok: false, error: "Please enter your name." };
  if (name.length > 80) return { ok: false, error: "That name is too long." };

  const phone = normalisePhone((input.phone ?? "").toString());
  if (!phone) return { ok: false, error: "Please enter a valid 10-digit mobile number." };

  const emailRaw = (input.email ?? "").toString().trim();
  if (emailRaw && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailRaw)) {
    return { ok: false, error: "That email address doesn't look right." };
  }

  const source = input.source as LeadSource;
  if (!LEAD_SOURCES.includes(source)) return { ok: false, error: "Unknown form." };

  // Cap meta so a crafted request can't write unbounded data.
  const meta: Record<string, string> = {};
  for (const [k, v] of Object.entries(input.meta ?? {}).slice(0, 12)) {
    if (v === null || v === undefined) continue;
    meta[k.slice(0, 40)] = String(v).slice(0, 300);
  }

  return {
    ok: true,
    lead: {
      name,
      phone,
      email: emailRaw || null,
      city: (input.city ?? "")?.toString().trim().slice(0, 60) || null,
      course: (input.course ?? "")?.toString().trim().slice(0, 60) || null,
      meta,
      source,
      collegeSlug: (input.collegeSlug ?? "")?.toString().trim().slice(0, 120) || null,
    },
  };
}

/* -------------------------------- API ---------------------------------- */

export async function createLead(input: NewLead): Promise<Lead> {
  const lead: Lead = {
    ...input,
    id: crypto.randomUUID(),
    status: "new",
    createdAt: new Date().toISOString(),
  };

  const db = getAdminDb();
  if (db) {
    await db.collection(COLLECTION).doc(lead.id).set(lead);
    return lead;
  }

  throw new Error("Firebase is not configured. Leads require Firestore.");
}

/**
 * Empty rather than throwing: the admin page has a banner for exactly this
 * case, and it can't show it if reading the list takes the render down.
 */
export async function listLeads(limit = 500): Promise<Lead[]> {
  const db = getAdminDb();
  if (!db) return [];

  const snap = await db.collection(COLLECTION).orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs.map((d) => d.data() as Lead);
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  const db = getAdminDb();
  if (db) {
    await db.collection(COLLECTION).doc(id).update({ status });
    return;
  }

  throw new Error("Firebase is not configured. Leads require Firestore.");
}

export function storageMode(): "firestore" | "file" {
  return isFirebaseConfigured() ? "firestore" : "file";
}
