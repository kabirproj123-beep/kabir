import Image from "next/image";
import Link from "next/link";
import { hero, media, stats } from "@/lib/content";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-48 -top-40 h-[46rem] w-[46rem] rounded-full opacity-70 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-sage), transparent 60%)" }}
      />

      <div className="container-x relative grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-12 items-center pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* left: the thesis */}
        <div className="max-w-2xl">
          <p className="eyebrow">{hero.eyebrow}</p>

          <h1 className="display-2xl mt-7 text-ink">
            {hero.titleLead}{" "}
            <span className="font-serif italic font-normal text-terra">
              {hero.titleAccent}
            </span>
          </h1>

          <p className="lede mt-8 max-w-lg">{hero.body}</p>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link href={hero.primaryCta.href} className="btn btn-primary px-7 py-4 text-base">
              {hero.primaryCta.label}
              <span aria-hidden>→</span>
            </Link>
            <Link
              href={hero.secondaryCta.href}
              className="font-display text-base font-semibold text-ink link-underline"
            >
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>

        {/* right: photograph + floating credential */}
        <div className="relative">
          <div className="relative aspect-[4/5] sm:aspect-[5/5] w-full overflow-hidden rounded-[2rem] border border-line">
            <Image
              src={media.hero}
              alt="A counsellor guiding a student through their options"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(12,36,27,0.28), transparent 45%)" }}
            />
          </div>

          {/* floating glass badge */}
          <div className="absolute -bottom-5 -left-3 sm:left-6 rounded-2xl bg-paper/90 backdrop-blur border border-line px-5 py-4 shadow-[0_20px_40px_-24px_rgba(18,50,39,0.5)]">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-paper font-display text-sm font-bold">
                1:1
              </span>
              <div>
                <div className="font-display text-sm font-bold text-ink">Senior mentors</div>
                <div className="text-xs text-moss">not junior agents</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* stats rail */}
      <div className="border-y border-line bg-line">
        <div className="container-x grid grid-cols-2 md:grid-cols-4 gap-px bg-line">
          {stats.map((s) => (
            <div key={s.label} className="bg-paper px-3 py-9 text-center">
              <div className="font-display text-4xl md:text-5xl font-extrabold text-forest tracking-tight">
                {s.value}
              </div>
              <div className="mt-2 text-sm text-moss">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
