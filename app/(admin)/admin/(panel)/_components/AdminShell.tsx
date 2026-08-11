"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LinkProgress } from "@/components/LinkProgress";
import { logout } from "../actions";

/**
 * The panel's frame: a fixed rail on desktop, an off-canvas drawer under it.
 */

type Item = { path: string; label: string; icon: React.ReactNode };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const NAV: Item[] = [
  {
    path: "/",
    label: "Enquiries",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4.5" {...stroke}>
        <path d="M3 13h4l2 3h6l2-3h4" />
        <path d="M5 5h14l2 8v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4Z" />
      </svg>
    ),
  },
  {
    path: "/colleges",
    label: "Colleges",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4.5" {...stroke}>
        <path d="M12 3 3 8h18Z" />
        <path d="M5 8v11M19 8v11M9.5 8v11M14.5 8v11M3 19h18" />
      </svg>
    ),
  },
  {
    path: "/team",
    label: "Team",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4.5" {...stroke}>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3 20a6 6 0 0 1 12 0" />
        <path d="M16 5.5a3.2 3.2 0 0 1 0 5M18 20a6 6 0 0 0-2-4.5" />
      </svg>
    ),
  },
];

export default function AdminShell({
  me,
  children,
}: {
  me: { name: string; username: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const hrefFor = (path: string) => (path === "/" ? "/admin" : `/admin${path}`);
  const isActive = (path: string) => {
    const href = hrefFor(path);
    return path === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  };
  const current = NAV.find((i) => isActive(i.path))?.label ?? "Admin";

  const rail = (
    <div className="flex h-full flex-col bg-navy text-white">
      <Link
        href={hrefFor("/")}
        className="flex items-center gap-2.5 border-b border-line-navy px-5 py-4"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-600 font-display text-base font-extrabold">
          K
        </span>
        <span className="min-w-0">
          <span className="block font-display text-sm font-bold leading-tight">Kabir</span>
          <span className="block text-[0.68rem] uppercase tracking-[0.14em] text-brand">
            Admin
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={hrefFor(item.path)}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-600/15 text-white shadow-[inset_2px_0_0_var(--color-brand)]"
                  : "text-on-navy-dim hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={active ? "text-brand" : "text-faint"}>{item.icon}</span>
              {item.label}
              <LinkProgress />
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line-navy p-3">
        <div className="px-2 pb-2">
          <p className="truncate text-sm font-semibold">{me.name}</p>
          <p className="truncate text-xs text-faint">@{me.username}</p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-on-navy-dim hover:bg-white/5 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="size-4" {...stroke}>
            <path d="M14 4h6v6M20 4l-8 8" />
            <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
          </svg>
          View site
        </Link>
        <form action={logout}>
          <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-on-navy-dim hover:bg-white/5 hover:text-white">
            <svg viewBox="0 0 24 24" className="size-4" {...stroke}>
              <path d="M9 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3" />
              <path d="M16 16l4-4-4-4M20 12H10" />
            </svg>
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="lg:pl-60">
      {/* desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 lg:block">{rail}</aside>

      {/* mobile bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="-ml-1 grid size-9 place-items-center rounded-lg border border-line"
        >
          <svg viewBox="0 0 24 24" className="size-5" {...stroke}>
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <span className="font-display text-sm font-bold">{current}</span>
      </header>

      {/* mobile drawer */}
      {open && (
        <div className="lg:hidden">
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-navy/50 backdrop-blur-[2px]"
          />
          {/* Closing on click, rather than on route change, keeps the drawer
              from lingering over the page a tapped link just navigated to. */}
          <aside
            onClick={() => setOpen(false)}
            className="fixed inset-y-0 left-0 z-50 w-64 shadow-2xl"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 z-10 grid size-8 place-items-center rounded-lg text-on-navy-dim hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" className="size-5" {...stroke}>
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
            {rail}
          </aside>
        </div>
      )}

      <main className="min-h-[calc(100vh-3.5rem)] lg:min-h-screen">{children}</main>
    </div>
  );
}
