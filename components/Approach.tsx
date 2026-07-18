import { steps } from "@/lib/content";
import { Reveal } from "./Reveal";

/**
 * The process is a genuine sequence, so numbered markers (01–04) carry real
 * information here. Rendered on a deep-forest band to give the page a strong
 * dark anchor between two cream sections.
 */
export function Approach() {
  return (
    <section id="approach" className="bg-forest text-paper py-24 lg:py-32">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="eyebrow" style={{ color: "var(--color-terra)" }}>
            How we work
          </p>
          <h2 className="display-lg mt-5 text-paper">
            A clear path, walked with you.
          </h2>
          <p className="lede mt-5" style={{ color: "var(--color-cream-dim)" }}>
            No black boxes, no surprise fees. Every student moves through the same
            four stages — you always know where you are and what&rsquo;s next.
          </p>
        </div>

        <ol className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {steps.map((step, i) => (
            <Reveal as="li" key={step.id} delay={i * 0.08}>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-5xl font-extrabold text-terra">
                    {step.id}
                  </span>
                  <span className="h-px flex-1 bg-line-forest" aria-hidden />
                </div>
                <h3 className="font-display text-xl font-bold mt-5 text-paper">
                  {step.title}
                </h3>
                <p className="mt-3 text-[0.98rem]" style={{ color: "var(--color-cream-dim)" }}>
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
