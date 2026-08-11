import Link from "next/link";
import type { Metadata } from "next";
import { collegesSource, getAllColleges } from "@/lib/collegeStore";
import { hasVerifiedFee } from "@/lib/colleges";
import PageHeader from "../_components/PageHeader";
import CollegesTable, { type CollegeRow } from "./CollegesTable";

export const metadata: Metadata = { title: "Colleges" };
export const dynamic = "force-dynamic";

/**
 * Fetches the catalogue and projects it down to the columns the table shows —
 * ~25 KB rather than the 640 KB the full records would cost — then lets the
 * browser do the filtering. `saved` and `deleted` still arrive in the query
 * string, because they're set by a redirect after a Server Action.
 */
export default async function AdminCollegesPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await props.searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]) as string | undefined;

  const saved = one("saved");
  const deleted = one("deleted");

  const all = await getAllColleges();
  const source = await collegesSource();

  const rows: CollegeRow[] = all
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      shortName: c.short_name,
      stream: c.stream,
      city: c.city ?? null,
      nirf: c.nirf_rank ?? null,
      fee: c.total_fee_value ?? null,
      feeVerified: hasVerifiedFee(c),
      updatedAt: c.updatedAt ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <PageHeader
        title="Colleges"
        sub={`${all.length} in the catalogue`}
        actions={
          <Link href="/admin/colleges/new" className="btn btn-primary px-4 py-2 text-sm">
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

        <CollegesTable rows={rows} />
      </div>
    </>
  );
}
