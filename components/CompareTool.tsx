"use client";

/**
 * Side-by-side college comparison — the site's primary lead magnet.
 *
 * Headline metrics are shown free; the rest of the table is blurred behind a
 * lead form, mirroring the reference site's funnel. The gate is presentational
 * only: the data is already public on each college page, so nothing sensitive
 * is being withheld — it exists to prompt an enquiry, not to hide facts.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { LeadForm } from "./LeadForm";
import { formatINR, formatLPA, hasVerifiedFee, type College } from "@/lib/colleges";

type Row = { label: string; get: (c: College) => string; gated?: boolean };

const ROWS: Row[] = [
  {
    label: "Total fees",
    get: (c) => (hasVerifiedFee(c) ? formatINR(c.total_fee_value) : "On request"),
  },
  { label: "Average package", get: (c) => formatLPA(c.avg_ctc_value) },
  { label: "NIRF ranking", get: (c) => (c.nirf_rank ? `#${c.nirf_rank}` : "—") },
  { label: "Highest package", get: (c) => formatLPA(c.highest_package_value), gated: true },
  {
    label: "Placement rate",
    get: (c) => (c.placement_rate ? `${c.placement_rate}%` : "—"),
    gated: true,
  },
  { label: "Return on investment", get: (c) => roi(c), gated: true },
  { label: "Campus size", get: (c) => c.campus_size ?? "—", gated: true },
  { label: "NAAC grade", get: (c) => c.naac_grade ?? "—", gated: true },
  { label: "Affiliation", get: (c) => c.affiliation ?? "—", gated: true },
];

/** Crude but honest: how many times the total fee the first year's CTC covers. */
function roi(c: College): string {
  // Never compute ROI from an unverified fee — the ratio would be as wrong as
  // the denominator, and it reads like a precise judgement.
  if (!c.avg_ctc_value || !hasVerifiedFee(c) || !c.total_fee_value) return "—";
  const x = c.avg_ctc_value / c.total_fee_value;
  const band = x >= 5 ? "Excellent" : x >= 2 ? "Strong" : "Moderate";
  return `${band} (${x.toFixed(1)}x)`;
}

export function CompareTool({ colleges }: { colleges: College[] }) {
  const [aSlug, setA] = useState(colleges[0]?.slug ?? "");
  const [bSlug, setB] = useState(colleges[1]?.slug ?? "");
  const [unlocked, setUnlocked] = useState(false);

  const a = useMemo(() => colleges.find((c) => c.slug === aSlug), [colleges, aSlug]);
  const b = useMemo(() => colleges.find((c) => c.slug === bSlug), [colleges, bSlug]);

  const select =
    "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="card overflow-hidden">
        <div className="grid gap-3 border-b border-line bg-paper-2 p-3 sm:grid-cols-2 sm:p-4">
          <div>
            <label htmlFor="cmp-a" className="mb-1 block text-xs font-semibold text-muted">
              College A
            </label>
            <select id="cmp-a" value={aSlug} onChange={(e) => setA(e.target.value)} className={select}>
              {colleges.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.short_name || c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cmp-b" className="mb-1 block text-xs font-semibold text-muted">
              College B
            </label>
            <select id="cmp-b" value={bSlug} onChange={(e) => setB(e.target.value)} className={select}>
              {colleges.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.short_name || c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="dtable min-w-[34rem]">
            <thead>
              <tr>
                <th>Metric</th>
                <th>{a?.short_name ?? "—"}</th>
                <th>{b?.short_name ?? "—"}</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => {
                const hidden = r.gated && !unlocked;
                return (
                  <tr key={r.label}>
                    <td className="text-sm font-medium text-muted">{r.label}</td>
                    <td
                      className={`font-semibold text-ink ${hidden ? "select-none blur-[5px]" : ""}`}
                      aria-hidden={hidden || undefined}
                    >
                      {a ? r.get(a) : "—"}
                    </td>
                    <td
                      className={`font-semibold text-ink ${hidden ? "select-none blur-[5px]" : ""}`}
                      aria-hidden={hidden || undefined}
                    >
                      {b ? r.get(b) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {a && b && (
          <div className="flex flex-wrap gap-2 border-t border-line p-4">
            <Link href={`/colleges/${a.slug}`} className="btn btn-ghost px-3 py-2 text-sm">
              View {a.short_name}
            </Link>
            <Link href={`/colleges/${b.slug}`} className="btn btn-ghost px-3 py-2 text-sm">
              View {b.short_name}
            </Link>
          </div>
        )}
      </div>

      <div className="card h-fit border-brand/40 p-5">
        {unlocked ? (
          <div className="text-center">
            <p className="font-display text-lg font-bold">Full comparison unlocked</p>
            <p className="mt-1 text-sm text-muted">
              A counsellor will call to walk you through the numbers.
            </p>
          </div>
        ) : (
          <>
            <p className="eyebrow">Unlock full comparison</p>
            <h3 className="mt-1 font-display text-lg font-bold">
              ROI, placements, campus &amp; rankings
            </h3>
            <p className="mt-1 mb-4 text-sm text-muted">
              See every metric side by side and get a free shortlist call.
            </p>
            <LeadForm
              source="compare-unlock"
              compact
              submitLabel="Unlock full report"
              successTitle="Unlocked."
              successBody="Scroll up to see the full comparison."
              onDone={() => setUnlocked(true)}
              hiddenMeta={{
                compared: [a?.name, b?.name].filter(Boolean).join(" vs "),
              }}
              extraFields={[
                {
                  name: "preferred_course",
                  label: "Preferred course*",
                  type: "select",
                  required: true,
                  options: [
                    "B.Tech (Engineering)",
                    "MBA (Management)",
                    "MBBS (Medical)",
                    "LLB / BA LLB (Law)",
                    "B.Pharm (Pharmacy)",
                    "Other",
                  ],
                },
              ]}
            />
          </>
        )}
      </div>
    </div>
  );
}
