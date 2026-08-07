import type { Metadata } from "next";
import Link from "next/link";
import { citiesIn, countByStreamIn } from "@/lib/colleges";
import { getAllColleges } from "@/lib/collegeStore";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: `${site.name} helps students across Maharashtra choose the right college with real fee, placement and ranking data — and free counselling.`,
};

export default async function AboutPage() {
  const all = await getAllColleges();
  const counts = countByStreamIn(all);
  const cities = citiesIn(all);

  const stats = [
    { value: `${all.length}`, label: "Maharashtra colleges" },
    { value: `${cities.length}`, label: "Cities covered" },
    { value: `${all.reduce((n, c) => n + c.courses.length, 0)}`, label: "Programmes listed" },
    { value: site.yearsGuiding, label: "Years guiding students" },
  ];

  return (
    <div className="bg-paper-2">
      <div className="border-b border-line bg-navy text-white">
        <div className="container-x py-12">
          <p className="eyebrow text-brand">About {site.name}</p>
          <h1 className="display-lg mt-2 max-w-3xl font-display">
            Straight answers about Maharashtra admissions
          </h1>
          <p className="mt-3 max-w-2xl text-on-navy-dim">
            Most college websites are brochures. We publish the numbers that actually decide a
            choice — total fees, average package, ranking — and say plainly where the data is thin.
          </p>
        </div>
      </div>

      <div className="container-x py-10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card p-6">
              <p className="font-display text-3xl font-extrabold text-brand-700">{s.value}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="card p-6">
            <h2 className="display-md font-display">What we cover</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              We deliberately cover one state properly rather than the whole country badly. Every
              college on this site is in Maharashtra.
            </p>
            <ul className="mt-4 space-y-1">
              {Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .map(([stream, n]) => (
                  <li
                    key={stream}
                    className="flex items-center justify-between border-b border-line py-2 text-sm"
                  >
                    <Link
                      href={`/colleges?stream=${encodeURIComponent(stream)}`}
                      className="font-medium text-ink hover:text-brand-700 hover:underline"
                    >
                      {stream}
                    </Link>
                    <span className="font-semibold text-muted">{n} colleges</span>
                  </li>
                ))}
            </ul>
          </section>

          <section className="card p-6">
            <h2 className="display-md font-display">Where our data comes from</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
              <p>
                Fees, placement packages and rankings are compiled from public college disclosures,
                NIRF reports and published ranking data, then normalised into a single comparable
                format.
              </p>
              <p>
                Some fields are genuinely missing for some colleges — we show a dash rather than
                inventing a number. Placement figures in particular are self-reported by
                institutions and should be treated as indicative.
              </p>
              <p>
                We don&apos;t publish exam dates or cutoffs, because those change every cycle and a
                stale number is worse than none. Ask a counsellor for the current cycle instead.
              </p>
            </div>
            <Link href="/counselling" className="btn btn-primary mt-5 px-4 py-2 text-sm">
              Book free counselling
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
