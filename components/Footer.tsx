"use client";

import Link from "next/link";
import { site } from "@/lib/content";
import { COURSES, EXAMS } from "@/lib/catalog";
import { PRIMARY_STREAMS } from "@/lib/colleges";

const COLUMNS = [
  {
    title: "Colleges",
    links: PRIMARY_STREAMS.map((s) => ({
      label: `${s} colleges`,
      href: `/colleges?stream=${encodeURIComponent(s)}`,
    })),
  },
  {
    title: "Courses",
    links: COURSES.map((c) => ({ label: c.name, href: `/colleges?stream=${encodeURIComponent(c.stream)}` })),
  },
  {
    title: "Exams",
    links: EXAMS.slice(0, 5).map((e) => ({ label: e.name, href: "/exams" })),
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Counselling", href: "/counselling" },
      { label: "Study abroad", href: "/study-abroad" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white">
      <div className="container-x py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-lg bg-brand-600 font-display text-lg font-extrabold text-white">
                {site.name.charAt(0)}
              </span>
              <span className="font-display text-lg font-extrabold">{site.name}</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-on-navy-dim">{site.description}</p>
            <ul className="mt-5 space-y-1.5 text-sm text-on-navy-dim">
              <li>
                <a href={`tel:${site.whatsapp}`} className="hover:text-white">
                  {site.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="hover:text-white">
                  {site.email}
                </a>
              </li>
              <li>{site.address}</li>
            </ul>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="font-display text-xs font-bold uppercase tracking-widest text-brand">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-on-navy-dim hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line-navy pt-7 text-xs text-on-navy-dim sm:flex-row">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <p>
            College data compiled from public disclosures and ranking reports — verify before you
            decide.
          </p>
        </div>
      </div>
    </footer>
  );
}
