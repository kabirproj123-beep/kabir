import Link from "next/link";
import { site } from "@/lib/content";

/** A quiet, confident band that bridges a page into the contact step. */
export function CtaBand() {
  return (
    <section className="py-20 lg:py-24">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[2rem] bg-forest px-8 py-16 sm:px-14 sm:py-20 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--color-terra), transparent 62%)" }}
          />
          <p className="eyebrow justify-center" style={{ color: "var(--color-terra)" }}>
            Your move
          </p>
          <h2 className="display-lg mt-6 mx-auto max-w-2xl text-paper">
            The best time to start was last year. The second best is today.
          </h2>
          <p className="lede mt-6 mx-auto max-w-xl" style={{ color: "var(--color-cream-dim)" }}>
            One free session is all it takes to know where you stand and what&rsquo;s
            possible. No cost, no commitment.
          </p>
          <Link href="/contact" className="btn btn-accent mt-10 px-7 py-4 text-base">
            Book a free session with {site.name}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
