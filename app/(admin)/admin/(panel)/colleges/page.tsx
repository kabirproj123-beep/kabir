import Link from "next/link";
import type { Metadata } from "next";
import { collegesSource, getAllColleges } from "@/lib/collegeStore";
import { hasVerifiedFee, formatINR, selectColleges, STREAMS } from "@/lib/colleges";
import DeleteCollegeButton from "./DeleteCollegeButton";
import PageHeader from "../_components/PageHeader";
import Pager from "../_components/Pager";

export const metadata: Metadata = { title: "Colleges" };
export const dynamic = "force-dynamic";

const PER_PAGE = 25;

function Fee({ value, verified }: { value: number | null | undefined; verified: boolean }) {
  return verified ? (
    <span className="tabular-nums">{formatINR(value)}</span>
  ) : (
    <span className="text-faint" title="Fee not verified — hidden on the public page">
      on request
    </span>
  );
}

export default async function AdminCollegesPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await props.searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]) as string | undefined;

  const q = one("q") ?? "";
  const stream = one("stream") ?? "All";
  const saved = one("saved");
  const deleted = one("deleted");

  const all = await getAllColleges();
  const source = await collegesSource();
  const results = selectColleges(all, { q, stream, sort: "name" });

  const pageCount = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const page = Math.min(Math.max(1, Number(one("page")) || 1), pageCount);
  const rows = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const listHref = "/admin/colleges";
  const editHref = (slug: string) => `/admin/colleges/${slug}`;
  const filtered = q !== "" || stream !== "All";

  const action =
    "rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold hover:bg-paper-2";

  return (
    <>
      <PageHeader
        title="Colleges"
        sub={`${all.length} in the catalogue`}
        actions={
          <Link
            href="/admin/colleges/new"
            className="btn btn-primary px-4 py-2 text-sm"
          >
            Add college
          </Link>
        }
      />

      <div className="space-y-4 p-4 sm:p-6">
        {source === "bundled" && (
          <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            Editing is unavailable — changes to a college won&apos;t save. The public site is
            still showing this list. Ask your developer to check the site&apos;s database
            connection.
          </p>
        )}
        {saved && (
          <p className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800">
            Saved.{" "}
            <Link href={`/colleges/${saved}`} className="font-semibold underline">
              View the public page
            </Link>
          </p>
        )}
        {deleted && (
          <p className="rounded-xl border border-line bg-white p-4 text-sm text-muted">
            Deleted <span className="font-semibold text-ink">{deleted}</span>.
          </p>
        )}

        {/* Plain GET form, so a filtered view stays shareable. */}
        <form className="card flex flex-wrap items-end gap-3 p-4">
          <label className="min-w-[14rem] flex-1">
            <span className="mb-1 block text-xs font-semibold text-muted">Search</span>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Name, short name or city"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-muted">Stream</span>
            <select
              name="stream"
              defaultValue={stream}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
            >
              <option value="All">All streams</option>
              {STREAMS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <button className="btn btn-ghost px-4 py-2 text-sm">Filter</button>
          {filtered && (
            <Link href={listHref} className="px-1 py-2 text-sm text-muted underline">
              Clear
            </Link>
          )}
        </form>

        <div className="card overflow-hidden">
          {/* desktop */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="dtable min-w-[58rem]">
              <thead>
                <tr>
                  <th>College</th>
                  <th>Stream</th>
                  <th>City</th>
                  <th>NIRF</th>
                  <th>Total fee</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.slug}>
                    <td>
                      <Link
                        href={editHref(c.slug)}
                        className="font-semibold text-ink hover:underline"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap text-sm">{c.stream}</td>
                    <td className="whitespace-nowrap text-sm">{c.city ?? "—"}</td>
                    <td className="text-sm tabular-nums">{c.nirf_rank ?? "—"}</td>
                    <td className="whitespace-nowrap text-sm">
                      <Fee value={c.total_fee_value} verified={hasVerifiedFee(c)} />
                    </td>
                    <td className="whitespace-nowrap text-xs tabular-nums text-muted">
                      {c.updatedAt
                        ? new Date(c.updatedAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link href={editHref(c.slug)} className={action}>
                          Edit
                        </Link>
                        <Link href={`/colleges/${c.slug}`} className={action}>
                          View
                        </Link>
                        <DeleteCollegeButton slug={c.slug} name={c.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* phone */}
          <ul className="divide-y divide-line lg:hidden">
            {rows.map((c) => (
              <li key={c.slug} className="p-4">
                <Link href={editHref(c.slug)} className="font-semibold text-ink">
                  {c.name}
                </Link>
                <p className="mt-0.5 text-xs text-muted">
                  {c.stream}
                  {c.city ? ` · ${c.city}` : ""}
                  {c.nirf_rank ? ` · NIRF ${c.nirf_rank}` : ""}
                </p>
                <p className="mt-1 text-sm">
                  <Fee value={c.total_fee_value} verified={hasVerifiedFee(c)} />
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Link href={editHref(c.slug)} className={action}>
                    Edit
                  </Link>
                  <Link href={`/colleges/${c.slug}`} className={action}>
                    View
                  </Link>
                  <DeleteCollegeButton slug={c.slug} name={c.name} />
                </div>
              </li>
            ))}
          </ul>

          {results.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-display text-lg font-bold">Nothing matches that search</p>
              <Link href={listHref} className="mt-2 inline-block text-sm text-brand-700 underline">
                Clear the filters
              </Link>
            </div>
          ) : (
            <Pager
              page={page}
              pageCount={pageCount}
              total={results.length}
              perPage={PER_PAGE}
              href={listHref}
              params={{ q, stream: stream === "All" ? undefined : stream }}
              unit="colleges"
            />
          )}
        </div>
      </div>
    </>
  );
}
