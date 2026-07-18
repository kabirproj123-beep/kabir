"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/content";
import { Logo } from "./Logo";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-paper/85 backdrop-blur-md border-b border-line"
          : "bg-paper/0 border-b border-transparent"
      }`}
    >
      <div className="container-x flex items-center justify-between h-18 py-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label={`${site.name} home`}>
          <Logo className="h-7 w-7 text-forest" />
          <span className="font-display text-xl font-extrabold tracking-tight text-ink">
            {site.name}
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`font-display text-sm font-medium link-underline ${
                isActive(item.href) ? "text-ink" : "text-ink/70 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link href="/contact" className="btn btn-primary px-5 py-2.5 text-sm">
            Book a free session
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden inline-flex flex-col justify-center gap-[5px] p-2 -mr-2"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span className={`block h-0.5 w-6 bg-ink transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-ink transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-x-0 top-18 bottom-0 bg-paper z-40 border-t border-line">
          <nav className="container-x flex flex-col py-6" aria-label="Mobile">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-display text-2xl font-semibold text-ink py-4 border-b border-line"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/contact" className="btn btn-primary mt-6 justify-center px-5 py-3.5 text-base">
              Book a free session
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
