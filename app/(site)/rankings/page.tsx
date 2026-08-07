import type { Metadata } from "next";
import Link from "next/link";
import { filterColleges } from "@/lib/collegeStore";
import {
  formatINR,
  formatLPA,
  hasVerifiedFee,
  PRIMARY_STREAMS,
  STREAMS,
  type Stream,
} from "@/lib/colleges";

export const metadata: Metadata = {
  title: "Maharashtra College Rankings — Engineering, Medical, MBA & Law",
  description:
    "Top-ranked colleges in Maharashtra by stream, with NIRF rank, total fees and average placement package side by side.",
};

export default async function RankingsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await props.searchParams;
  const raw = Array.isArray(sp.stream) ? sp.stream[0] : sp.stream;
  const stream = (STREAMS as readonly string[]).includes(raw ?? "")
    ? (raw as Stream)
    : ("Engineering" as Stream);

  const list = (await filterColleges({ stream, sort: "rank" })).slice(0, 50);

  return (
    <div className="bg-paper-2">
      <div className="border-b border-line bg-navy text-white">
        <div className="container-x py-10">
          <p className="eyebrow text-brand">Rankings</p>
          <h1 className="display-lg mt-2 font-display">
            Top {stream} colleges in Maharashtra
          </h1>
          <p className="mt-3 max-w-2xl text-on-navy-dim">
            Ranked using NIRF position where available, then average placement package. Colleges
            without a published NIRF rank appear after those that have one.
          </p>
        </div>
      </div>

      <div className="container-x py-8">
        <div className="flex flex-wrap gap-2">
          {[...PRIMARY_STREAMS, ...STREAMS.filter((s) => !PRIMARY_STREAMS.includes(s))].map((s) => (
            <Link
              key={s}
              href={`/rankings?stream=${encodeURIComponent(s)}`}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                s === stream
                  ? "border-brand bg-brand-tint text-brand-700"
                  : "border-line bg-white text-muted hover:bg-paper-2"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>

        <div className="card mt-6 overflow-x-auto">
          <table className="dtable min-w-[46rem]">
            <thead>
              <tr>
                <th className="w-16">Rank</th>
                <th>College</th>
                <th>City</th>
                <th>Ownership</th>
                <th>Total fees</th>
                <th>Avg package</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c, i) => (
                <tr key={c.slug}>
                  <td>
                    <span className="grid size-8 place-items-center rounded-lg bg-paper-3 font-display text-sm font-bold text-ink">
                      {i + 1}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/colleges/${c.slug}`}
                      className="font-semibold text-ink hover:text-brand-700 hover:underline"
                    >
                      {c.short_name || c.name}
                    </Link>
                    {c.nirf_rank ? (
                      <span className="chip ms-2">NIRF #{c.nirf_rank}</span>
                    ) : null}
                  </td>
                  <td className="text-sm text-muted">{c.city}</td>
                  <td className="text-sm text-muted">{c.ownership ?? "—"}</td>
                  <td className="whitespace-nowrap font-semibold">
                    {hasVerifiedFee(c) ? (
                      formatINR(c.total_fee_value)
                    ) : (
                      <span className="text-muted">On request</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap font-semibold">
                    {formatLPA(c.avg_ctc_value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-faint">
          Fees shown are total course fees cross-checked against a second source, with the
          programme named on each college page. Where we couldn&apos;t verify a figure we show
          &ldquo;on request&rdquo; rather than an unreliable number. Placement figures are
          self-reported by institutions — confirm both with the college before deciding.
        </p>
      </div>
    </div>
  );
}
