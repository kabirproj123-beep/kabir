/**
 * Leads — the core of the business. Every gated tool on the site (comparison
 * unlock, loan calculator, counselling request, newsletter) funnels here, and
 * the admin panel at /admin reads it back.
 *
 * Storage: Firestore when credentials exist, otherwise a JSON file under
 * .data/leads.json so the site is demoable before Firebase is provisioned.
 * The file store is single-process and NOT for production — it exists so no
 * lead is silently dropped during setup.
 */
import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getAdminDb, isFirebaseConfigured } from "./firebaseAdmin";

export const LEAD_SOURCES = [
  "compare-unlock",
  "loan-calculator",
  "counselling",
  "college-enquiry",
  "newsletter",
  "contact",
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
const FILE = path.join(process.cwd(), ".data", "leads.json");

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

/* ------------------------------ file store ----------------------------- */

async function readFileStore(): Promise<Lead[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Lead[];
  } catch {
    return [];
  }
}

async function writeFileStore(leads: Lead[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(leads, null, 1), "utf8");
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

  const all = await readFileStore();
  all.unshift(lead);
  await writeFileStore(all);
  return lead;
}

export async function listLeads(limit = 500): Promise<Lead[]> {
  const db = getAdminDb();
  if (db) {
    const snap = await db.collection(COLLECTION).orderBy("createdAt", "desc").limit(limit).get();
    return snap.docs.map((d) => d.data() as Lead);
  }
  const all = await readFileStore();
  return all
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  const db = getAdminDb();
  if (db) {
    await db.collection(COLLECTION).doc(id).update({ status });
    return;
  }
  const all = await readFileStore();
  const hit = all.find((l) => l.id === id);
  if (hit) {
    hit.status = status;
    await writeFileStore(all);
  }
}

export function storageMode(): "firestore" | "file" {
  return isFirebaseConfigured() ? "firestore" : "file";
}
