"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site } from "@/lib/content";
import { LinkProgress } from "./LinkProgress";

const NAV = [
  { label: "Colleges", href: "/colleges" },
  { label: "Rankings", href: "/rankings" },
  { label: "Courses", href: "/courses" },
  { label: "Exams", href: "/exams" },
  { label: "Counselling", href: "/counselling" },
  { label: "Study Abroad", href: "/study-abroad" },
  { label: "About", href: "/about" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${site.name} home`}>
          <span className="grid size-9 place-items-center rounded-lg bg-brand-600 font-display text-lg font-extrabold text-white">
            {site.name.charAt(0)}
          </span>
          <span className="font-display text-[0.95rem] font-extrabold leading-none tracking-tight">
            <span className="block">{site.name.toUpperCase()}</span>
            <span className="block text-[0.62rem] font-semibold tracking-[0.18em] text-brand-700">
              MAHARASHTRA
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-tint text-brand-700"
                    : "text-muted hover:bg-paper-2 hover:text-ink"
                }`}
              >
                {item.label}
                <LinkProgress />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${site.phone.replace(/\s/g, "")}`}
            className="hidden text-sm font-semibold text-ink xl:block"
          >
            {site.phone}
          </a>
          {/* the mobile bottom bar already carries this CTA on small screens */}
          <Link href="/counselling" className="btn btn-primary hidden px-3.5 py-2 text-sm sm:inline-flex">
            Free counselling
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-9 place-items-center rounded-lg border border-line lg:hidden"
          >
            <span aria-hidden>{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-white lg:hidden" aria-label="Mobile">
          <div className="container-x grid gap-1 py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-paper-2"
              >
                {item.label}
                <LinkProgress />
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
