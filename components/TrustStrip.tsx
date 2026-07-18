import { admits } from "@/lib/content";

/**
 * Pure-CSS marquee of universities students have been admitted to.
 * The list is duplicated once so the -50% translate loops seamlessly.
 * Text wordmarks (not logos) — no trademark assets, still reads as credibility.
 */
export function TrustStrip() {
  const items = [...admits, ...admits];

  return (
    <section className="py-10 border-b border-line bg-paper">
      <div className="container-x">
        <p className="text-center font-display text-xs font-semibold uppercase tracking-[0.16em] text-moss">
          Where our students got in
        </p>
      </div>
      <div className="marquee-mask mt-6 overflow-hidden">
        <ul className="marquee-track flex w-max items-center gap-12 pr-12" aria-label="Universities our students have been admitted to">
          {items.map((name, i) => (
            <li
              key={`${name}-${i}`}
              aria-hidden={i >= admits.length}
              className="font-display text-lg font-semibold text-ink/55 whitespace-nowrap"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
