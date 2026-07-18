/**
 * Content resolver — the single place the site reads editable content from.
 *
 * DRAFT MODE: returns the local defaults from lib/content.ts.
 *
 * GOING LIVE: uncomment the Firestore branch below. It reads the document at
 * `content/site`, then deep-merges it over the defaults, so the admin panel
 * only needs to store the fields it wants to override. Because the shape is
 * identical to lib/content.ts, no component code has to change.
 */
import * as defaults from "./content";

export type SiteContent = {
  site: typeof defaults.site;
  hero: typeof defaults.hero;
  stats: typeof defaults.stats;
  services: typeof defaults.services;
  steps: typeof defaults.steps;
  destinations: typeof defaults.destinations;
  testimonials: typeof defaults.testimonials;
  faqs: typeof defaults.faqs;
  nav: typeof defaults.nav;
};

const local: SiteContent = {
  site: defaults.site,
  hero: defaults.hero,
  stats: defaults.stats,
  services: defaults.services,
  steps: defaults.steps,
  destinations: defaults.destinations,
  testimonials: defaults.testimonials,
  faqs: defaults.faqs,
  nav: defaults.nav,
};

export async function getContent(): Promise<SiteContent> {
  // --- GOING LIVE (server-side, requires firebase-admin credentials) ---
  // try {
  //   const { adminDb } = await import("./firebaseAdmin");
  //   const snap = await adminDb.doc("content/site").get();
  //   if (snap.exists) {
  //     return { ...local, ...(snap.data() as Partial<SiteContent>) };
  //   }
  // } catch (err) {
  //   console.warn("Falling back to local content:", err);
  // }
  return local;
}
