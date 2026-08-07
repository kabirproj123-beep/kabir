import type { Metadata } from "next";
import Link from "next/link";
import { EXAMS } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Entrance Exams — JEE, NEET, CAT, CLAT & MHT-CET",
  description:
    "The entrance exams that matter for Maharashtra admissions: who conducts them, who is eligible, and which colleges accept them.",
};

export default function ExamsPage() {
  const national = EXAMS.filter((e) => e.level === "National");
  const state = EXAMS.filter((e) => e.level === "State");

  return (
    <div className="bg-paper-2">
      <div className="border-b border-line bg-white">
        <div className="container-x py-10">
          <p className="eyebrow">Entrance exams</p>
          <h1 className="display-lg mt-2 font-display">Exams that open doors in Maharashtra</h1>
          <p className="lede mt-3 max-w-2xl">
            Most Maharashtra seats are filled through one of these. State CETs carry a domicile
            advantage that national exams do not — worth planning for early.
          </p>
        </div>
      </div>

      <div className="container-x space-y-10 py-8">
        {[
          { title: "National exams", list: national },
          { title: "Maharashtra state CETs", list: state },
        ].map((group) => (
          <section key={group.title}>
            <h2 className="display-md font-display">{group.title}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {group.list.map((e) => (
                <div key={e.slug} className="card p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink">{e.name}</h3>
                      <p className="text-sm text-muted">{e.full}</p>
                    </div>
                    <span className="chip chip-brand">{e.level}</span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-muted">{e.blurb}</p>

                  <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
                    <div className="flex gap-2">
                      <dt className="w-28 shrink-0 text-xs uppercase tracking-wide text-faint">
                        Conducted by
                      </dt>
                      <dd className="text-muted">{e.conductedBy}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-28 shrink-0 text-xs uppercase tracking-wide text-faint">
                        Mode
                      </dt>
                      <dd className="text-muted">{e.mode}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-28 shrink-0 text-xs uppercase tracking-wide text-faint">
                        Eligibility
                      </dt>
                      <dd className="text-muted">{e.eligibility}</dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {e.streams.map((s) => (
                      <Link
                        key={s}
                        href={`/colleges?stream=${encodeURIComponent(s)}`}
                        className="chip hover:border-brand hover:text-brand-700"
                      >
                        {s} colleges →
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <p className="text-xs text-faint">
          Exam patterns and schedules change every cycle. We deliberately don&apos;t publish dates
          or cutoffs here — ask a counsellor for the current cycle rather than trusting a page that
          may be out of date.
        </p>
      </div>
    </div>
  );
}
