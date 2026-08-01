"use client";

/**
 * Horizontal scroll-snap carousel.
 *
 * Built on native scrolling rather than a transform-based slider: it keeps
 * touch/trackpad momentum on mobile for free, degrades gracefully without JS,
 * and never traps keyboard users. Arrows are progressive enhancement and hide
 * themselves when there's nothing to scroll to.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export function Carousel({
  children,
  ariaLabel,
  className = "",
}: {
  children: React.ReactNode;
  ariaLabel: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [sync]);

  const nudge = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    // Scroll by roughly one card, so a click always lands on a card boundary.
    const card = el.querySelector<HTMLElement>("[data-slide]");
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const hideAll = atStart && atEnd; // everything fits — no arrows needed

  return (
    <div className={`relative ${className}`}>
      <div
        ref={ref}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {!hideAll && (
        <>
          <button
            type="button"
            onClick={() => nudge(-1)}
            disabled={atStart}
            aria-label="Scroll left"
            className="absolute -left-3 top-1/2 hidden size-9 -translate-y-1/2 place-items-center rounded-full
                       border border-line bg-white shadow-md transition-opacity hover:bg-paper-2
                       disabled:pointer-events-none disabled:opacity-0 md:grid"
          >
            <span aria-hidden>‹</span>
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            disabled={atEnd}
            aria-label="Scroll right"
            className="absolute -right-3 top-1/2 hidden size-9 -translate-y-1/2 place-items-center rounded-full
                       border border-line bg-white shadow-md transition-opacity hover:bg-paper-2
                       disabled:pointer-events-none disabled:opacity-0 md:grid"
          >
            <span aria-hidden>›</span>
          </button>
        </>
      )}
    </div>
  );
}

/** One slide. Fixed widths so the snap step is predictable across breakpoints. */
export function Slide({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-slide
      className="w-[16rem] shrink-0 snap-start sm:w-[17rem] lg:w-[18rem]"
    >
      {children}
    </div>
  );
}
