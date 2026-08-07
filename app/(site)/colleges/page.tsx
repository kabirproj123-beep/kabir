import type { Metadata } from "next";
import Link from "next/link";
import { CollegeCard } from "@/components/CollegeCard";
import { citiesIn, selectColleges, STREAMS, type Sort } from "@/lib/colleges";
import { getAllColleges } from "@/lib/collegeStore";

export const metadata: Metadata = {
  title: "Colleges in Maharashtra — Fees, Placements & Rankings",
  description:
    "Browse every major college in Maharashtra. Filter by stream, city, ownership and fees. Compare NIRF rankings, total fees and average placement packages.",
};

const SORTS: { value: Sort; label: string }[] = [
  { value: "rank", label: "NIRF ranking" },
  { value: "fee-low", label: "Fees: low to high" },
  { value: "fee-high", label: "Fees: high to low" },
  { value: "ctc", label: "Highest avg package" },
  { value: "name", label: "Name (A–Z)" },
];

const OWNERSHIPS = ["All", "Government", "Private"];

/** `searchParams` is a Promise in Next 16. */
export default async function CollegesPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await props.searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]) as string | undefined;

  const stream = one("stream") ?? "All";
  const city = one("city") ?? "All";
  const ownership = one("ownership") ?? "All";
  const q = one("q") ?? "";
  const sort = (one("sort") as Sort) ?? "rank";

  const all = await getAllColleges();
  const results = selectColleges(all, { stream, city, ownership, q, sort });
  const total = all.length;
  const cities = citiesIn(all);

  const selectCls =
    "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-ink";

  return (
    <div className="bg-paper-2">
      {/* header */}
      <div className="border-b border-line bg-white">
        <div className="container-x py-10">
          <p className="eyebrow">Maharashtra</p>
          <h1 className="display-lg mt-2 font-display">
            Find your college in <span className="text-brand-700">Maharashtra</span>
          </h1>
          <p className="lede mt-3 max-w-2xl">
            {total} institutions across Engineering, Medical, Management, Law, Pharmacy and
            Architecture — with real fees, placement packages and rankings.
          </p>
        </div>
      </div>

      <div className="container-x py-8">
        {/* filters — a plain GET form so every result set is linkable and indexable */}
        <form className="card p-4" method="get">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <label htmlFor="q" className="mb-1 block text-xs font-semibold text-muted">
                Search
              </label>
              <input
                id="q"
                name="q"
                defaultValue={q}
                placeholder="College, city or stream…"
                className={selectCls}
              />
            </div>

            <div>
              <label htmlFor="stream" className="mb-1 block text-xs font-semibold text-muted">
                Stream
              </label>
              <select id="stream" name="stream" defaultValue={stream} className={selectCls}>
                <option value="All">All streams</option>
                {STREAMS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="city" className="mb-1 block text-xs font-semibold text-muted">
                City
              </label>
              <select id="city" name="city" defaultValue={city} className={selectCls}>
                <option value="All">All cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sort" className="mb-1 block text-xs font-semibold text-muted">
                Sort by
              </label>
              <select id="sort" name="sort" defaultValue={sort} className={selectCls}>
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted">Ownership</span>
            {OWNERSHIPS.map((o) => (
              <label key={o} className="cursor-pointer">
                <input
                  type="radio"
                  name="ownership"
                  value={o}
                  defaultChecked={ownership === o}
                  className="peer sr-only"
                />
                <span className="chip peer-checked:border-brand peer-checked:bg-brand-tint peer-checked:text-brand-700">
                  {o}
                </span>
              </label>
            ))}

            <div className="ms-auto flex gap-2">
              <Link href="/colleges" className="btn btn-ghost px-3 py-2 text-sm">
                Clear
              </Link>
              <button className="btn btn-primary px-4 py-2 text-sm">Apply filters</button>
            </div>
          </div>
        </form>

        <p className="mt-6 text-sm text-muted">
          Showing <strong className="text-ink">{results.length}</strong>{" "}
          {results.length === 1 ? "college" : "colleges"}
          {stream !== "All" && ` in ${stream}`}
          {city !== "All" && ` · ${city}`}
        </p>

        {results.length === 0 ? (
          <div className="card mt-4 p-12 text-center">
            <p className="font-display text-lg font-bold">No colleges match those filters</p>
            <p className="mt-1 text-sm text-muted">Try widening your search or clearing filters.</p>
            <Link href="/colleges" className="btn btn-primary mt-4 px-4 py-2 text-sm">
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((c) => (
              <CollegeCard key={c.slug} college={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
