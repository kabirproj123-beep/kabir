import Image from "next/image";
import { testimonials } from "@/lib/content";
import { Reveal } from "./Reveal";

export function Testimonials() {
  return (
    <section id="stories" className="bg-sage py-28 lg:py-40">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="eyebrow">Student stories</p>
          <h2 className="display-lg mt-6 text-ink">
            The proof is in where they landed.
          </h2>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Reveal as="div" key={t.id} delay={i * 0.08}>
              <figure className="h-full flex flex-col rounded-[1.75rem] bg-paper p-8 border border-line">
                <span className="font-serif text-5xl leading-none text-terra" aria-hidden>
                  &ldquo;
                </span>
                <blockquote className="mt-2 flex-1 font-serif text-lg italic leading-relaxed text-ink">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-7 pt-6 border-t border-line flex items-center gap-3.5">
                  <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-line">
                    <Image src={t.avatar} alt="" fill sizes="44px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block font-display font-bold text-ink">{t.name}</span>
                    <span className="block text-sm text-moss">{t.detail}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
