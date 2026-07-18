import Image from "next/image";
import { media, site } from "@/lib/content";
import { Reveal } from "./Reveal";

const proficiencies = [
  { label: "Admissions counselling", value: 96 },
  { label: "Test-prep coaching", value: 91 },
  { label: "Visa & scholarship success", value: 88 },
];

export function About() {
  return (
    <section id="about" className="py-24 lg:py-32">
      <div className="container-x grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="eyebrow">Why {site.name}</p>
          <h2 className="display-lg mt-6 text-ink">
            {site.yearsGuiding} years of telling students what they actually need
            to hear.
          </h2>
          <p className="mt-7 text-lg text-moss leading-relaxed">
            We started in {site.location} with a simple frustration: too many
            consultants sell the same three universities — and nothing else — to
            everyone. We do the opposite. We read your profile honestly and build
            the whole plan around you, whether that ends in a campus down the road
            or across the world.
          </p>
          <p className="mt-4 text-lg text-moss leading-relaxed">
            Senior mentors, not junior agents, work your case from the first call
            to your first day on the job.
          </p>

          <div className="mt-10 space-y-6">
            {proficiencies.map((p) => (
              <div key={p.label}>
                <div className="flex items-baseline justify-between">
                  <span className="font-display font-semibold text-ink">{p.label}</span>
                  <span className="font-display text-sm font-bold text-terra">{p.value}%</span>
                </div>
                <div className="mt-2.5 h-2 rounded-full bg-line-strong overflow-hidden">
                  <div className="h-full rounded-full bg-forest" style={{ width: `${p.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Reveal className="relative">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-line">
            <Image
              src={media.about}
              alt="A Meridian mentor in a counselling session with a student"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
