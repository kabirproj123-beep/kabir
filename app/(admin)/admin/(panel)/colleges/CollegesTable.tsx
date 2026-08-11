"use client";

/**
 * The college table, filtered in the browser.
 *
 * The catalogue is ~190 rows and projects to about 25 KB of the fields this
 * table actually shows, so it ships once and every search keystroke, stream
 * change and page turn is instant. The old GET form re-ran the whole render —
 * session lookup included — for each one.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { STREAMS, formatINR } from "@/lib/colleges";
import DeleteCollegeButton from "./DeleteCollegeButton";
import ClientPager from "../_components/ClientPager";

const PER_PAGE = 25;

export type CollegeRow = {
  slug: string;
  name: string;
  shortName: string;
  stream: string;
  city: string | null;
  nirf: number | null;
  fee: number | null;
  feeVerified: boolean;
  updatedAt: string | null;
};

function Fee({ row }: { row: CollegeRow }) {
  return row.feeVerified ? (
    <span className="tabular-nums">{formatINR(row.fee)}</span>
  ) : (
    <span className="text-faint" title="Fee not verified — hidden on the public page">
      on request
    </span>
  );
}

const action =
  "rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold hover:bg-paper-2";

export default function CollegesTable({ rows: all }: { rows: CollegeRow[] }) {
  const [q, setQ] = useState("");
  const [stream, setStream] = useState("All");
  const [page, setPage] = useState(1);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((c) => {
      if (stream !== "All" && c.stream !== stream) return false;
      if (!needle) return true;
      return (
        c.name.toLowerCase().includes(needle) ||
        c.shortName.toLowerCase().includes(needle) ||
        (c.city ?? "").toLowerCase().includes(needle) ||
        c.stream.toLowerCase().includes(needle)
      );
    });
  }, [all, q, stream]);

  const pageCount = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const rows = results.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const filtered = q !== "" || stream !== "All";
  const editHref = (slug: string) => `/admin/colleges/${slug}`;

  function clear() {
    setQ("");
    setStream("All");
    setPage(1);
  }

  return (
    <>
      <div className="card flex flex-wrap items-end gap-3 p-4">
        <label className="min-w-[14rem] flex-1">
          <span className="mb-1 block text-xs font-semibold text-muted">Search</span>
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Name, short name or city"
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-muted">Stream</span>
          <select
            value={stream}
            onChange={(e) => {
              setStream(e.target.value);
              setPage(1);
            }}
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
        {filtered && (
          <button type="button" onClick={clear} className="px-1 py-2 text-sm text-muted underline">
            Clear
          </button>
        )}
      </div>

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
                  <td className="text-sm tabular-nums">{c.nirf ?? "—"}</td>
                  <td className="whitespace-nowrap text-sm">
                    <Fee row={c} />
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
                {c.nirf ? ` · NIRF ${c.nirf}` : ""}
              </p>
              <p className="mt-1 text-sm">
                <Fee row={c} />
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
            <button
              type="button"
              onClick={clear}
              className="mt-2 inline-block text-sm text-brand-700 underline"
            >
              Clear the filters
            </button>
          </div>
        ) : (
          <ClientPager
            page={current}
            pageCount={pageCount}
            total={results.length}
            perPage={PER_PAGE}
            unit="colleges"
            onPage={setPage}
          />
        )}
      </div>
    </>
  );
}
