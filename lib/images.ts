/**
 * College photography.
 *
 * Images come from Wikipedia/Wikimedia Commons under free licences and are
 * stored locally in public/colleges (see scripts/scrape/fetch_images.py).
 * Matching is intentionally conservative: a college with no confident match
 * gets no photo rather than someone else's building. Coverage is therefore
 * partial by design, and the UI falls back to a generated gradient.
 *
 * Most of these licences (CC BY, CC BY-SA) require attribution, so every photo
 * carries its credit — see `CollegeImage`.
 */
import images from "@/data/college_images.json";

export type ImageMeta = {
  src: string;
  wikipedia_title: string;
  license: string | null;
  author: string | null;
};

const MAP = images as Record<string, ImageMeta>;

export function getImage(slug: string): ImageMeta | null {
  return MAP[slug] ?? null;
}

export function hasImage(slug: string): boolean {
  return slug in MAP;
}

export function imageCount(): number {
  return Object.keys(MAP).length;
}

/** Short credit line, e.g. "Photo: Jane Doe / CC BY-SA 4.0 via Wikimedia". */
export function creditLine(meta: ImageMeta): string {
  const bits = [meta.author, meta.license].filter(Boolean);
  return bits.length ? `Photo: ${bits.join(" / ")} · Wikimedia` : "Photo via Wikimedia Commons";
}
