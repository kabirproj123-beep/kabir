import Link from "next/link";
import type { Metadata } from "next";
import { CollegeCard } from "@/components/CollegeCard";
import { CompareTool } from "@/components/CompareTool";
import { LoanCalculator } from "@/components/LoanCalculator";
import { LeadForm } from "@/components/LeadForm";
import { Carousel, Slide } from "@/components/Carousel";
import { CountUp, Reveal } from "@/components/Motion";
import { Marquee } from "@/components/Marquee";
import { countByStreamIn, PRIMARY_STREAMS, topInStream } from "@/lib/colleges";
import { getAllColleges } from "@/lib/collegeStore";
import { faqs, site } from "@/lib/content";

export const metadata: Metadata = {
  title: `${site.name} — Compare Maharashtra Colleges, Fees & Placements`,
  description: site.description,
};

const TOOLS = [
  { icon: "🎓", label: "All colleges", href: "/colleges" },
  { icon: "🏆", label: "Rankings", href: "/rankings" },
  { icon: "📊", label: "Compare", href: "#compare" },
  { icon: "💵", label: "Loan calculator", href: "#loan" },
  { icon: "📚", label: "Courses", href: "/courses" },
  { icon: "📝", label: "Entrance exams", href: "/exams" },
  { icon: "🤝", label: "Counselling", href: "/counselling" },
  { icon: "✈️", label: "Study abroad", href: "/study-abroad" },
];

export default async function Home() {
  // One fetch, then every rail is derived from it in memory.
  const all = await getAllColleges();
  const counts = countByStreamIn(all);
  const byStream = Object.fromEntries(
    PRIMARY_STREAMS.map((s) => [s, topInStream(all, s, 12)] as const),
  );

  // Compare tool: a manageable, recognisable subset rather than the full list.
  const comparePool = PRIMARY_STREAMS.flatMap((s) => byStream[s]).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const cities = new Set(all.map((c) => c.city).filter(Boolean));
  const totalCourses = all.reduce((n, c) => n + c.courses.length, 0);
  const totalFaqs = all.reduce((n, c) => n + c.faqs.length, 0);

  // Recognisable names for the scrolling strip — one per stream, interleaved.
  const marqueeNames = PRIMARY_STREAMS.flatMap((s) =>
    byStream[s].slice(0, 5).map((c) => c.short_name || c.name),
  );

  return (
    <>
      {/* ------------------------------ hero ------------------------------ */}
      <section className="border-b border-line bg-gradient-to-b from-brand-tint/60 to-white">
        <div className="container-x py-14 md:py-20">
          <div className="max-w-3xl">
            <span className="chip chip-brand">Maharashtra · {all.length} colleges</span>
            <h1 className="display-xl mt-4 font-display">
              Your career begins with <span className="text-brand-700">the right admission</span>
            </h1>
            <p className="lede mt-4 max-w-2xl">
              Compare every major college in Maharashtra — real fees, placement packages and
              rankings for Engineering, Medical, Management and Law. Then talk to a counsellor,
              free.
            </p>

            <form action="/colleges" method="get" className="mt-6 flex max-w-xl gap-2">
              <input
                name="q"
                placeholder="Search a college, city or course…"
                aria-label="Search colleges"
                className="w-full rounded-lg border border-line bg-white px-4 py-3 text-sm shadow-sm"
              />
              <button className="btn btn-primary px-5 py-3 text-sm">Search</button>
            </form>

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted">
              <span>
                <strong className="text-ink">{cities.size}</strong> cities
              </span>
              <span>
                <strong className="text-ink">{counts.Engineering ?? 0}</strong> engineering
              </span>
              <span>
                <strong className="text-ink">{counts.Medical ?? 0}</strong> medical
              </span>
              <span>
                <strong className="text-ink">{counts.Management ?? 0}</strong> management
              </span>
              <span>
                <strong className="text-ink">{counts.Law ?? 0}</strong> law
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------- marquee ---------------------------- */}
      <section className="border-b border-line bg-paper-2 py-4">
        <p className="container-x mb-2 text-xs font-semibold uppercase tracking-widest text-faint">
          Colleges students are comparing right now
        </p>
        <Marquee items={marqueeNames} label="Popular colleges" />
      </section>

      {/* ------------------------------ tools ----------------------------- */}
      <section className="border-b border-line bg-white">
        <div className="container-x py-10">
          <p className="eyebrow">Platform tools</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {TOOLS.map((t) => (
              <Link
                key={t.label}
                href={t.href}
                className="card card-hover flex flex-col items-center gap-2 p-4 text-center"
              >
                <span aria-hidden className="text-2xl">
                  {t.icon}
                </span>
                <span className="font-display text-xs font-bold leading-tight">{t.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- by stream --------------------------- */}
      {PRIMARY_STREAMS.map((stream, i) => {
        const list = byStream[stream].slice(0, 10);
        if (list.length === 0) return null;
        return (
          <section
            key={stream}
            className={`border-b border-line ${i % 2 ? "bg-white" : "bg-paper-2"}`}
          >
            <div className="container-x py-10">
              <Reveal>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="eyebrow">{counts[stream]} colleges</p>
                    <h2 className="display-md mt-1 font-display">
                      Top {stream} colleges in Maharashtra
                    </h2>
                  </div>
                  <Link
                    href={`/colleges?stream=${encodeURIComponent(stream)}`}
                    className="btn btn-ghost px-4 py-2 text-sm"
                  >
                    View all {stream.toLowerCase()} →
                  </Link>
                </div>

                <Carousel ariaLabel={`Top ${stream} colleges`} className="mt-5">
                  {list.map((c) => (
                    <Slide key={c.slug}>
                      <CollegeCard college={c} />
                    </Slide>
                  ))}
                </Carousel>
              </Reveal>
            </div>
          </section>
        );
      })}

      {/* ------------------------------ stats ----------------------------- */}
      <section className="border-b border-line bg-navy text-white">
        <div className="container-x py-12">
          <Reveal>
            <p className="eyebrow text-brand">By the numbers</p>
            <h2 className="display-md mt-1 font-display">Maharashtra, covered properly</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { n: all.length, suffix: "", label: "Colleges listed" },
                { n: totalCourses, suffix: "", label: "Programmes with fees" },
                { n: cities.size, suffix: "", label: "Cities covered" },
                { n: totalFaqs, suffix: "", label: "Questions answered" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-line-navy bg-navy-2 p-5">
                  <p className="font-display text-3xl font-extrabold text-brand">
                    <CountUp to={s.n} suffix={s.suffix} />
                  </p>
                  <p className="mt-1 text-sm text-on-navy-dim">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------- compare ---------------------------- */}
      <section id="compare" className="border-b border-line bg-white">
        <div className="container-x py-12">
          <p className="eyebrow">Compare</p>
          <h2 className="display-lg mt-1 font-display">Compare colleges without confusion</h2>
          <p className="lede mt-2 max-w-2xl">
            Pick any two institutions and review fees, placements and ROI side by side.
          </p>
          <div className="mt-6">
            <CompareTool colleges={comparePool} />
          </div>
        </div>
      </section>

      {/* ------------------------------ loan ------------------------------ */}
      <section id="loan" className="border-b border-line bg-paper-2">
        <div className="container-x py-12">
          <p className="eyebrow">Education finance</p>
          <h2 className="display-lg mt-1 font-display">Plan your education loan &amp; EMI</h2>
          <p className="lede mt-2 max-w-2xl">
            Estimate monthly payments and get free help securing a low-interest student loan.
          </p>
          <div className="mt-6">
            <LoanCalculator />
          </div>
        </div>
      </section>

      {/* ------------------------------ faq ------------------------------- */}
      <section className="border-b border-line bg-white">
        <div className="container-x grid gap-8 py-12 lg:grid-cols-[1fr_22rem]">
          <div>
            <p className="eyebrow">Support centre</p>
            <h2 className="display-lg mt-1 font-display">Frequently asked questions</h2>
            <div className="mt-5 divide-y divide-line">
              {faqs.map((f) => (
                <details key={f.q} className="py-3">
                  <summary className="cursor-pointer list-none font-display font-bold text-ink marker:content-none">
                    {f.q}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="card h-fit border-brand/40 p-5">
            <p className="eyebrow">Newsletter</p>
            <h3 className="mt-1 font-display text-lg font-bold">
              Get admission &amp; cutoff alerts
            </h3>
            <p className="mt-1 mb-4 text-sm text-muted">
              College notifications, exam dates and counselling updates.
            </p>
            <LeadForm
              source="newsletter"
              compact
              submitLabel="Subscribe"
              successTitle="You're subscribed."
              successBody="We'll send updates for your chosen course."
              extraFields={[
                {
                  name: "course",
                  label: "Choose your course*",
                  type: "select",
                  required: true,
                  options: ["B.Tech", "MBA", "MBBS", "LLB / BA LLB", "B.Pharm", "Other"],
                },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
