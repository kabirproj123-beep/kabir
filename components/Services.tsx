import { services } from "@/lib/content";
import { Reveal } from "./Reveal";

export function Services() {
  return (
    <section id="services" className="py-28 lg:py-40">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="eyebrow">What we do</p>
          <h2 className="display-lg mt-6 text-ink">
            Four ways we move you forward.
          </h2>
          <p className="lede mt-6">
            Most students arrive for one of these and stay for the rest — because
            the right college, the right score, and the right career are one
            conversation, not four.
          </p>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <Reveal as="div" key={service.id} delay={(i % 2) * 0.08}>
              <article className="card group h-full flex flex-col p-8 lg:p-10">
                <span className="font-display text-sm font-semibold text-terra">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="display-md mt-5 text-ink">{service.title}</h3>
                <p className="mt-4 text-moss leading-relaxed">{service.summary}</p>
                <ul className="mt-7 pt-7 border-t border-line flex flex-wrap gap-x-6 gap-y-2.5">
                  {service.points.map((point) => (
                    <li key={point} className="flex items-center gap-2.5 text-[0.95rem] text-ink">
                      <span className="h-1.5 w-1.5 rounded-full bg-terra shrink-0" aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
