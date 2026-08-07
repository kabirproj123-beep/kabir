import Link from "next/link";
import type { Metadata } from "next";
import { adminBase, adminHref } from "@/lib/adminNav";
import { listLeads, storageMode, LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/leads";
import { setStatus } from "./actions";
import PageHeader from "./_components/PageHeader";
import Pager from "./_components/Pager";

export const metadata: Metadata = { title: "Enquiries" };
export const dynamic = "force-dynamic";

const PER_PAGE = 25;

const SOURCE_LABEL: Record<string, string> = {
  "compare-unlock": "Comparison unlock",
  "loan-calculator": "Loan calculator",
  counselling: "Counselling",
  "college-enquiry": "College enquiry",
  newsletter: "Newsletter",
  contact: "Contact",
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

export default async function EnquiriesPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const base = await adminBase();
  const sp = await props.searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]) as string | undefined;

  const filter = LEAD_STATUSES.find((s) => s === one("status"));
  const leads = await listLeads();

  const matching = filter ? leads.filter((l) => l.status === filter) : leads;
  const pageCount = Math.max(1, Math.ceil(matching.length / PER_PAGE));
  const page = Math.min(Math.max(1, Number(one("page")) || 1), pageCount);
  const rows = matching.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const today = leads.filter(
    (l) => new Date(l.createdAt).toDateString() === new Date().toDateString(),
  ).length;

  const href = adminHref(base, "/");
  const tabs = [
    { key: undefined, label: "All", n: leads.length },
    ...LEAD_STATUSES.map((s) => ({
      key: s as string | undefined,
      label: s,
      n: leads.filter((l) => l.status === s).length,
    })),
  ];

  return (
    <>
      <PageHeader
        title="Enquiries"
        sub={
          leads.length === 0
            ? "Leads from every form on the site land here."
            : `${leads.length} total · ${today} today`
        }
      />

      {storageMode() !== "firestore" && (
        <p className="mx-4 mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 sm:mx-6">
          New enquiries aren&apos;t being saved permanently and will be lost on the next update.
          Ask your developer to check the site&apos;s database connection.
        </p>
      )}

      {/* Status rail — filter and counts in one line rather than a tile grid. */}
      <div className="sticky top-14 z-20 -mb-px overflow-x-auto border-b border-line bg-white px-4 lg:top-0 sm:px-6">
        <div className="flex min-w-max gap-1">
          {tabs.map((t) => {
            const active = filter === t.key || (!filter && !t.key);
            return (
              <Link
                key={t.label}
                href={t.key ? `${href}${href.includes("?") ? "&" : "?"}status=${t.key}` : href}
                aria-current={active ? "page" : undefined}
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
              </Link>
            );
          })}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {matching.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="font-display text-lg font-bold">
              {filter ? `Nothing ${filter}` : "No enquiries yet"}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
              {filter
                ? "Try another status."
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

            <Pager
              page={page}
              pageCount={pageCount}
              total={matching.length}
              perPage={PER_PAGE}
              href={href}
              params={{ status: filter }}
              unit="enquiries"
            />
          </div>
        )}
      </div>
    </>
  );
}
