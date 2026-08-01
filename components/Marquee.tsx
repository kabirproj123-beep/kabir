/**
 * Continuously scrolling strip of college names.
 *
 * Server component — the animation is pure CSS (see `.marquee-track` in
 * globals.css), which also means it stops for prefers-reduced-motion without
 * any JavaScript. The list is duplicated so the -50% translate loops seamlessly.
 */
export function Marquee({ items, label }: { items: string[]; label: string }) {
  if (items.length === 0) return null;
  const doubled = [...items, ...items];

  return (
    <div className="marquee-mask overflow-hidden py-1" aria-label={label} role="group">
      <div className="marquee-track flex w-max gap-3">
        {doubled.map((name, i) => (
          <span
            key={`${name}-${i}`}
            aria-hidden={i >= items.length || undefined}
            className="whitespace-nowrap rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-muted"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
