import Link from "next/link";

/**
 * Page links that carry the current filters along. Numbers are elided around
 * the current page so 200 colleges don't produce 8 rows of pagination on a
 * phone; the count line stays visible at every width because "which slice am I
 * looking at" is the question people actually ask of a paged table.
 */
export default function Pager({
  page,
  pageCount,
  total,
  perPage,
  href,
  params = {},
  unit,
}: {
  page: number;
  pageCount: number;
  total: number;
  perPage: number;
  href: string;
  params?: Record<string, string | undefined>;
  unit: string;
}) {
  const linkTo = (p: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
    if (p > 1) qs.set("page", String(p));
    const q = qs.toString();
    return q ? `${href}?${q}` : href;
  };

  const first = total === 0 ? 0 : (page - 1) * perPage + 1;
  const last = Math.min(page * perPage, total);

  // Always show first, last, and the two either side of the current page.
  const shown = new Set<number>([1, pageCount, page - 1, page, page + 1]);
  const numbers = [...shown].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);

  const step =
    "grid h-9 min-w-9 place-items-center rounded-lg border border-line bg-white px-3 text-sm font-semibold";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
      <p className="text-sm text-muted">
        {total === 0 ? `No ${unit}` : `${first}–${last} of ${total} ${unit}`}
      </p>

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1.5">
          {page > 1 ? (
            <Link href={linkTo(page - 1)} className={`${step} hover:bg-paper-2`} rel="prev">
              Previous
            </Link>
          ) : (
            <span className={`${step} text-faint`}>Previous</span>
          )}

          <span className="hidden items-center gap-1.5 sm:flex">
            {numbers.map((n, i) => (
              <span key={n} className="flex items-center gap-1.5">
                {i > 0 && n - numbers[i - 1] > 1 && <span className="px-1 text-faint">…</span>}
                {n === page ? (
                  <span
                    aria-current="page"
                    className="grid h-9 min-w-9 place-items-center rounded-lg bg-navy px-3 text-sm font-semibold text-white"
                  >
                    {n}
                  </span>
                ) : (
                  <Link href={linkTo(n)} className={`${step} hover:bg-paper-2`}>
                    {n}
                  </Link>
                )}
              </span>
            ))}
          </span>
          <span className="text-sm text-muted sm:hidden">
            {page} / {pageCount}
          </span>

          {page < pageCount ? (
            <Link href={linkTo(page + 1)} className={`${step} hover:bg-paper-2`} rel="next">
              Next
            </Link>
          ) : (
            <span className={`${step} text-faint`}>Next</span>
          )}
        </nav>
      )}
    </div>
  );
}
