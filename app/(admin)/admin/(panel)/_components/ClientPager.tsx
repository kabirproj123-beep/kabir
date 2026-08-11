"use client";

/**
 * The button-driven twin of Pager.
 *
 * Pager navigates — every page turn is a URL change and a server round trip.
 * Inside the panel's tables the whole result set is already in the browser, so
 * paging is a state update and should cost nothing.
 */
export default function ClientPager({
  page,
  pageCount,
  total,
  perPage,
  unit,
  onPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  perPage: number;
  unit: string;
  onPage: (p: number) => void;
}) {
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
          <button
            type="button"
            onClick={() => onPage(page - 1)}
            disabled={page <= 1}
            className={`${step} hover:bg-paper-2 disabled:text-faint disabled:hover:bg-white`}
          >
            Previous
          </button>

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
                  <button
                    type="button"
                    onClick={() => onPage(n)}
                    className={`${step} hover:bg-paper-2`}
                  >
                    {n}
                  </button>
                )}
              </span>
            ))}
          </span>
          <span className="text-sm text-muted sm:hidden">
            {page} / {pageCount}
          </span>

          <button
            type="button"
            onClick={() => onPage(page + 1)}
            disabled={page >= pageCount}
            className={`${step} hover:bg-paper-2 disabled:text-faint disabled:hover:bg-white`}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
