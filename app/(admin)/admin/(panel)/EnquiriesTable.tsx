"use client";

/**
 * The enquiries table, filtered in the browser.
 *
 * It used to be server-rendered per filter: each status tab was a <Link>, so
 * switching from "All" to "new" meant a URL change, a session lookup and a
 * Firestore read before a single pixel moved. The list is small enough to hold
 * in memory, so the tabs, the search box and the pager are all local state now
 * and switch in the same frame as the click.
 *
 * Only the one thing that genuinely needs the server — changing a lead's
 * status — still goes to it, through the existing Server Action.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/leadTypes";
import { setStatus } from "./actions";
import ClientPager from "./_components/ClientPager";

const PER_PAGE = 25;

const SOURCE_LABEL: Record<string, string> = {
  "compare-unlock": "Comparison unlock",
  "loan-calculator": "Loan calculator",
  counselling: "Counselling",
  "college-enquiry": "College enquiry",
  newsletter: "Newsletter",
  contact: "Contact",
  enquiry: "Site enquiry",
};

/** chip styles and the row's left edge, so status reads without being read. */
const STATUS: Record<LeadStatus, { chip: string; edge: string }> = {
  new: { chip: "bg-brand-tint text-brand-700 border-brand/40", edge: "bg-brand" },
  contacted: { chip: "bg-amber-50 text-amber-700 border-amber-300", edge: "bg-warn" },
  converted: { chip: "bg-emerald-50 text-emerald-700 border-emerald-300", edge: "bg-success" },
  closed: { chip: "bg-paper-3 text-muted border-line-strong", edge: "bg-line-strong" },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusForm({ lead }: { lead: Lead }) {
  return (
    <form action={setStatus} className="flex items-center gap-1.5">
      <input type="hidden" name="id" value={lead.id} />
      <select
        name="status"
        defaultValue={lead.status}
        className="rounded-lg border border-line bg-white px-2 py-1.5 text-xs font-medium capitalize"
        aria-label={`Status for ${lead.name}`}
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold hover:bg-paper-2">
        Save
      </button>
    </form>
  );
}

function Meta({ lead }: { lead: Lead }) {
  const entries = Object.entries(lead.meta ?? {});
  if (entries.length === 0) return <span className="text-faint">—</span>;
  return (
    <>
      {entries.map(([k, v]) => (
        <span key={k} className="mr-2 inline-block whitespace-nowrap">
          <span className="text-faint">{k}:</span> {v}
        </span>
      ))}
    </>
  );
}

export default function EnquiriesTable({ leads }: { leads: Lead[] }) {
  const [filter, setFilter] = useState<LeadStatus | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    const c = { new: 0, contacted: 0, converted: 0, closed: 0 } as Record<LeadStatus, number>;
    for (const l of leads) c[l.status] += 1;
    return c;
  }, [leads]);

  const matching = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (filter && l.status !== filter) return false;
      if (!needle) return true;
      return (
        l.name.toLowerCase().includes(needle) ||
        l.phone.includes(needle) ||
        (l.email ?? "").toLowerCase().includes(needle) ||
        (l.course ?? "").toLowerCase().includes(needle)
      );
    });
  }, [leads, filter, q]);

  const pageCount = Math.max(1, Math.ceil(matching.length / PER_PAGE));
  // A filter change can leave you past the end of the shorter list.
  const current = Math.min(page, pageCount);
  const rows = matching.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  function choose(next: LeadStatus | null) {
    setFilter(next);
    setPage(1);
  }

  const tabs: { key: LeadStatus | null; label: string; n: number }[] = [
    { key: null, label: "All", n: leads.length },
    ...LEAD_STATUSES.map((s) => ({ key: s as LeadStatus | null, label: s, n: counts[s] })),
  ];

  return (
    <>
      {/* Status rail — filter and counts in one line rather than a tile grid. */}
      <div className="sticky top-14 z-20 -mb-px overflow-x-auto border-b border-line bg-white px-4 lg:top-0 sm:px-6">
        <div className="flex min-w-max gap-1">
          {tabs.map((t) => {
            const active = filter === t.key;
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => choose(t.key)}
                aria-pressed={active}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-semibold capitalize transition-colors ${
                  active
                    ? "border-brand-600 text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {t.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[0.68rem] tabular-nums ${
                    active ? "bg-brand-tint text-brand-700" : "bg-paper-3 text-muted"
                  }`}
                >
                  {t.n}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search name, phone, email or interest"
          aria-label="Search enquiries"
          className="w-full max-w-sm rounded-lg border border-line bg-white px-3 py-2 text-sm"
        />

        {matching.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="font-display text-lg font-bold">
              {q ? "Nothing matches that search" : filter ? `Nothing ${filter}` : "No enquiries yet"}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
              {q || filter
                ? "Try another status or search."
                : "Leads submitted through any form on the site will appear here, newest first."}
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            {/* desktop */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="dtable min-w-[64rem]">
                <thead>
                  <tr>
                    <th className="w-1" />
                    <th>Received</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Interest</th>
                    <th>Source</th>
                    <th>Details</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => (
                    <tr key={l.id}>
                      <td className="!p-0">
                        <span className={`block h-full min-h-12 w-1 ${STATUS[l.status].edge}`} />
                      </td>
                      <td className="whitespace-nowrap text-xs tabular-nums text-muted">
                        {fmtDate(l.createdAt)}
                      </td>
                      <td>
                        <p className="font-semibold text-ink">{l.name}</p>
                        {l.email && <p className="text-xs text-muted">{l.email}</p>}
                      </td>
                      <td className="whitespace-nowrap">
                        <a
                          href={`tel:+91${l.phone}`}
                          className="font-semibold tabular-nums text-brand-700 hover:underline"
                        >
                          +91 {l.phone}
                        </a>
                      </td>
                      <td className="text-sm">
                        {l.course ?? "—"}
                        {l.collegeSlug && (
                          <Link
                            href={`/colleges/${l.collegeSlug}`}
                            className="block text-xs text-muted hover:underline"
                          >
                            {l.collegeSlug}
                          </Link>
                        )}
                      </td>
                      <td>
                        <span className="chip">{SOURCE_LABEL[l.source] ?? l.source}</span>
                      </td>
                      <td className="max-w-[16rem] text-xs text-muted">
                        <Meta lead={l} />
                      </td>
                      <td>
                        <StatusForm lead={l} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* phone — one card per lead, call button first */}
            <ul className="divide-y divide-line lg:hidden">
              {rows.map((l) => (
                <li key={l.id} className="flex gap-3 p-4">
                  <span
                    aria-hidden
                    className={`w-1 shrink-0 rounded-full ${STATUS[l.status].edge}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{l.name}</p>
                        <p className="text-xs tabular-nums text-muted">{fmtDate(l.createdAt)}</p>
                      </div>
                      <span className={`chip border capitalize ${STATUS[l.status].chip}`}>
                        {l.status}
                      </span>
                    </div>

                    <a
                      href={`tel:+91${l.phone}`}
                      className="btn btn-ghost mt-3 w-full py-2 text-sm tabular-nums"
                    >
                      Call +91 {l.phone}
                    </a>

                    <dl className="mt-3 space-y-1 text-xs text-muted">
                      <div className="flex gap-2">
                        <dt className="text-faint">Interest</dt>
                        <dd className="text-ink">{l.course ?? "—"}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-faint">Source</dt>
                        <dd>{SOURCE_LABEL[l.source] ?? l.source}</dd>
                      </div>
                      {l.email && (
                        <div className="flex min-w-0 gap-2">
                          <dt className="text-faint">Email</dt>
                          <dd className="truncate">{l.email}</dd>
                        </div>
                      )}
                      {Object.keys(l.meta ?? {}).length > 0 && (
                        <div className="pt-1">
                          <Meta lead={l} />
                        </div>
                      )}
                    </dl>

                    <div className="mt-3">
                      <StatusForm lead={l} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <ClientPager
              page={current}
              pageCount={pageCount}
              total={matching.length}
              perPage={PER_PAGE}
              unit="enquiries"
              onPage={setPage}
            />
          </div>
        )}
      </div>
    </>
  );
}
