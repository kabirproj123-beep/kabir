"use client";

/**
 * Top-of-page progress bar for an in-flight navigation.
 *
 * Dynamic routes (the whole admin panel, /colleges, /rankings) can't be served
 * from a prefetched cache — the browser has to wait on the server. Without a
 * signal the previous page just sits there and the click reads as ignored.
 *
 * `useLinkStatus` only reports for the <Link> it is rendered inside, so this
 * goes in the link's children; the bar itself is portalled to the top of the
 * document, where a progress indicator belongs.
 */
import { createPortal } from "react-dom";
import { useLinkStatus } from "next/link";

export function LinkProgress() {
  const { pending } = useLinkStatus();

  // `pending` only turns true once someone has clicked the link, which is
  // necessarily after hydration — so this never renders during the server pass
  // or the first client pass, and the portal can't cause a mismatch.
  if (!pending || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="status"
      aria-label="Loading page"
      className="nav-progress pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden bg-brand-tint"
    />,
    document.body,
  );
}
