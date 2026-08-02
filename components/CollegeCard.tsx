import Link from "next/link";
import Image from "next/image";
import { formatINR, formatLPA, hasVerifiedFee, type College } from "@/lib/colleges";
import { getImage } from "@/lib/images";

/**
 * Colleges without a confidently-matched photo get a deterministic gradient
 * keyed to the name — same college, same colours on every render, no layout
 * shift and no external requests.
 */
const GRADIENTS = [
  "from-sky-500 to-blue-700",
  "from-emerald-500 to-teal-700",
  "from-violet-500 to-indigo-700",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-700",
  "from-cyan-500 to-sky-700",
];

function gradientFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

function initials(name: string) {
  return name
    .replace(/[^A-Za-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export function CollegeCard({ college: c }: { college: College }) {
  const img = getImage(c.slug);
  const verified = hasVerifiedFee(c);

  return (
    <Link href={`/colleges/${c.slug}`} className="card card-hover flex h-full flex-col overflow-hidden">
      <div className="relative h-28 shrink-0 sm:h-32">
        {img ? (
          <>
            <Image
              src={img.src}
              alt={`${c.short_name || c.name} campus`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
            {/* keeps the rank badge legible over any photo */}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 to-black/0" />
          </>
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${gradientFor(c.name)}`}>
            <span className="absolute bottom-3 left-4 font-display text-2xl font-extrabold text-white/95">
              {initials(c.short_name || c.name)}
            </span>
          </div>
        )}

        {c.nirf_rank ? (
          <span className="absolute right-2.5 top-2.5 rounded-md bg-white/95 px-2 py-0.5 text-[0.7rem] font-bold text-ink">
            NIRF #{c.nirf_rank}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <h3 className="font-display text-[0.95rem] font-bold leading-snug text-ink sm:text-[0.98rem]">
          {c.short_name || c.name}
        </h3>
        <p className="mt-0.5 text-xs text-muted">
          {c.city}
          {c.ownership ? ` · ${c.ownership}` : ""}
        </p>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <span className="chip chip-brand">{c.stream}</span>
          {c.naac_grade && <span className="chip">NAAC {c.naac_grade}</span>}
          {c.rating ? <span className="chip">★ {c.rating}</span> : null}
        </div>

        <dl className="mt-auto grid grid-cols-2 gap-x-3 gap-y-1 border-t border-line pt-3 text-sm">
          <div>
            <dt className="text-[0.68rem] uppercase tracking-wide text-faint">
              {verified ? "Total fees" : "Fees"}
            </dt>
            <dd className={verified ? "font-semibold text-ink" : "font-semibold text-muted"}>
              {verified ? formatINR(c.total_fee_value) : "On request"}
            </dd>
          </div>
          <div>
            <dt className="text-[0.68rem] uppercase tracking-wide text-faint">Avg package</dt>
            <dd className="font-semibold text-ink">{formatLPA(c.avg_ctc_value)}</dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}
