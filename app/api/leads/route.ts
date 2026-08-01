/**
 * Lead intake. Every gated form on the site POSTs here.
 *
 * Route Handlers are not cached by default (Next 16), which is what we want —
 * this must always run at request time.
 */
import { NextResponse } from "next/server";
import { createLead, validateLead, type NewLead } from "@/lib/leads";

export const dynamic = "force-dynamic";

/**
 * Very small in-memory throttle. Not a substitute for a real WAF, but it stops
 * a single client hammering the form. Resets on deploy, which is acceptable.
 */
const HITS = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 6;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = HITS.get(ip);
  if (!entry || now > entry.resetAt) {
    HITS.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  let body: Partial<NewLead> & { website?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real users never fill a hidden field. Accept silently so bots
  // don't learn they were caught.
  if (body.website) return NextResponse.json({ ok: true });

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 },
    );
  }

  const result = validateLead(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const lead = await createLead(result.lead);
    return NextResponse.json({ ok: true, id: lead.id });
  } catch (err) {
    console.error("Failed to save lead:", err);
    return NextResponse.json(
      { error: "We couldn't save that. Please call us instead." },
      { status: 500 },
    );
  }
}
