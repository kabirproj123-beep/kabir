/**
 * Brand mark: a globe crossed by a single meridian line (a nod to the name),
 * with a terracotta marker where the journey begins. Uses currentColor for the
 * globe so it inherits text color; the marker stays terracotta.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
      <circle cx="16" cy="16" r="12.5" stroke="currentColor" strokeWidth="1.6" />
      <ellipse cx="16" cy="16" rx="5.2" ry="12.5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="3.5" y1="16" x2="28.5" y2="16" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="9" r="2.4" fill="var(--color-terra)" />
    </svg>
  );
}
