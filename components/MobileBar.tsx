"use client";

/**
 * Mobile-only sticky action bar, mirroring the reference site's bottom bar.
 *
 * On a phone the lead forms sit far down the page, so the two actions that
 * matter — call, or request a callback — need to be reachable at all times.
 */
import Link from "next/link";
import { site } from "@/lib/content";

export function MobileBar() {
  return (
    <>
      {/* spacer so the bar never covers the last of the page content */}
      <div aria-hidden className="h-16 lg:hidden" />

      <nav
        aria-label="Quick actions"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <div className="grid grid-cols-3">
          <a
            href={`tel:${site.phone.replace(/\s/g, "")}`}
            className="flex flex-col items-center gap-0.5 py-2.5 text-[0.68rem] font-semibold text-muted"
          >
            <span aria-hidden className="text-lg leading-none">
              📞
            </span>
            Call
          </a>
          <Link
            href="/colleges"
            className="flex flex-col items-center gap-0.5 py-2.5 text-[0.68rem] font-semibold text-muted"
          >
            <span aria-hidden className="text-lg leading-none">
              🎓
            </span>
            Colleges
          </Link>
          <Link
            href="/counselling"
            className="m-1.5 flex flex-col items-center justify-center gap-0.5 rounded-lg bg-brand-600 py-1.5 text-[0.68rem] font-bold text-white"
          >
            <span aria-hidden className="text-base leading-none">
              🤝
            </span>
            Free counselling
          </Link>
        </div>
      </nav>
    </>
  );
}
