import { destinations } from "@/lib/content";
import { Reveal } from "./Reveal";
import { RouteMap } from "./RouteMap";

export function Destinations() {
  return (
    <section id="destinations" className="py-24 lg:py-32">
      <div className="container-x">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-xl">
            <p className="eyebrow">Where students go</p>
            <h2 className="display-lg mt-6 text-ink">
              Eleven countries. One that fits you.
            </h2>
          </div>
          <p className="text-moss max-w-sm md:text-right">
            We&rsquo;re country-agnostic on purpose. The right destination depends on
            your course, budget, and where you want to be in five years.
          </p>
        </div>

        {/* signature route map */}
        <div className="mt-14 rounded-[2rem] border border-line bg-paper-2/50 p-6 sm:p-10">
          <RouteMap className="mx-auto w-full max-w-2xl h-auto" />
        </div>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {destinations.map((d, i) => (
            <Reveal as="div" key={d.code} delay={(i % 3) * 0.06}>
              <div className="group flex items-center gap-5 rounded-2xl border border-line bg-paper-2/40 p-6 transition-colors hover:bg-paper-2">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-forest">
                  <span className="font-display text-lg font-extrabold text-paper tracking-wide">
                    {d.code}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">{d.name}</h3>
                  <p className="text-sm text-moss">{d.note}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
