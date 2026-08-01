import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { isAdmin, isAdminConfigured } from "@/lib/adminAuth";
import { listLeads, storageMode, LEAD_STATUSES, type Lead } from "@/lib/leads";
import { logout, setStatus } from "./actions";

export const metadata: Metadata = { title: "Admin — Enquiries", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const SOURCE_LABEL: Record<string, string> = {
  "compare-unlock": "Comparison unlock",
  "loan-calculator": "Loan calculator",
  counselling: "Counselling",
  "college-enquiry": "College enquiry",
  newsletter: "Newsletter",
  contact: "Contact",
};

const STATUS_STYLE: Record<string, string> = {
  new: "bg-brand-tint text-brand-700 border-brand/40",
  contacted: "bg-amber-50 text-amber-700 border-amber-300",
  converted: "bg-emerald-50 text-emerald-700 border-emerald-300",
  closed: "bg-paper-3 text-muted border-line-strong",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminPage() {
  if (!isAdminConfigured()) {
    return (
      <div className="container-x py-20">
        <h1 className="display-md font-display">Admin not configured</h1>
        <p className="lede mt-3 max-w-xl">
          Set <code className="rounded bg-paper-3 px-1">ADMIN_PASSWORD</code> (8+ characters) in{" "}
          <code className="rounded bg-paper-3 px-1">.env.local</code>, then restart the server.
        </p>
      </div>
    );
  }

  if (!(await isAdmin())) redirect("/admin/login");

  const leads = await listLeads();
  const mode = storageMode();

  const counts = LEAD_STATUSES.map((s) => ({
    status: s,
    n: leads.filter((l) => l.status === s).length,
  }));
  const today = leads.filter(
    (l) => new Date(l.createdAt).toDateString() === new Date().toDateString(),
  ).length;

  return (
    <div className="container-x py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="display-md mt-1 font-display">Enquiries</h1>
          <p className="mt-1 text-sm text-muted">
            {leads.length} total · {today} today · storage:{" "}
            <span className={mode === "firestore" ? "text-emerald-600" : "text-amber-600"}>
              {mode === "firestore" ? "Firestore" : "local file (set up Firebase to persist)"}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="btn btn-ghost px-3 py-2 text-sm">
            View site
          </Link>
          <form action={logout}>
            <button className="btn btn-ghost px-3 py-2 text-sm">Sign out</button>
          </form>
        </div>
      </div>

      {/* status tiles */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {counts.map(({ status, n }) => (
          <div key={status} className="card p-4">
            <p className="text-2xl font-bold text-ink">{n}</p>
            <p className="mt-0.5 text-xs capitalize text-muted">{status}</p>
          </div>
        ))}
      </div>

      {leads.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="font-display text-lg font-bold">No enquiries yet</p>
          <p className="mt-1 text-sm text-muted">
            Leads submitted through any form on the site will appear here.
          </p>
        </div>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="dtable min-w-[62rem]">
            <thead>
              <tr>
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
              {leads.map((l: Lead) => (
                <tr key={l.id}>
                  <td className="whitespace-nowrap text-xs text-muted">{fmtDate(l.createdAt)}</td>
                  <td>
                    <p className="font-semibold text-ink">{l.name}</p>
                    {l.email && <p className="text-xs text-muted">{l.email}</p>}
                  </td>
                  <td className="whitespace-nowrap">
                    <a href={`tel:+91${l.phone}`} className="font-medium text-brand-700 hover:underline">
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
                    {Object.entries(l.meta ?? {}).length === 0
                      ? "—"
                      : Object.entries(l.meta).map(([k, v]) => (
                          <span key={k} className="mr-2 inline-block">
                            <span className="text-faint">{k}:</span> {v}
                          </span>
                        ))}
                  </td>
                  <td>
                    <form action={setStatus} className="flex items-center gap-1.5">
                      <input type="hidden" name="id" value={l.id} />
                      <span
                        className={`chip border ${STATUS_STYLE[l.status] ?? ""} capitalize`}
                      >
                        {l.status}
                      </span>
                      <select
                        name="status"
                        defaultValue={l.status}
                        className="rounded-md border border-line bg-white px-1.5 py-1 text-xs"
                        aria-label={`Change status for ${l.name}`}
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button className="rounded-md border border-line px-2 py-1 text-xs font-semibold hover:bg-paper-2">
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
