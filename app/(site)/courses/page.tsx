import type { Metadata } from "next";
import Link from "next/link";
import { COURSES } from "@/lib/catalog";
import { countByStream } from "@/lib/collegeStore";

export const metadata: Metadata = {
  title: "Courses — B.Tech, MBA, MBBS, Law & Pharmacy in Maharashtra",
  description:
    "Course directory for Maharashtra: eligibility, duration, entrance exams and the colleges that offer each programme.",
};

export default async function CoursesPage() {
  const counts = await countByStream();

  return (
    <div className="bg-paper-2">
      <div className="border-b border-line bg-white">
        <div className="container-x py-10">
          <p className="eyebrow">Courses</p>
          <h1 className="display-lg mt-2 font-display">What do you want to study?</h1>
          <p className="lede mt-3 max-w-2xl">
            Eligibility, duration and the entrance exams that matter — plus every Maharashtra
            college offering the programme.
          </p>
        </div>
      </div>

      <div className="container-x grid gap-4 py-8 md:grid-cols-2">
        {COURSES.map((c) => (
          <div key={c.slug} className="card card-hover flex flex-col p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-ink">{c.name}</h2>
                <p className="text-sm text-muted">{c.full}</p>
              </div>
              <span className="chip chip-brand">{c.level}</span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted">{c.blurb}</p>

            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-faint">Duration</dt>
                <dd className="font-semibold text-ink">{c.duration}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-faint">Colleges</dt>
                <dd className="font-semibold text-ink">{counts[c.stream] ?? 0} in Maharashtra</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs uppercase tracking-wide text-faint">Eligibility</dt>
                <dd className="text-muted">{c.eligibility}</dd>
              </div>
            </dl>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.exams.map((e) => (
                <span key={e} className="chip">
                  {e}
                </span>
              ))}
            </div>

            <Link
              href={`/colleges?stream=${encodeURIComponent(c.stream)}`}
              className="btn btn-primary mt-5 px-4 py-2 text-sm"
            >
              Browse {c.stream.toLowerCase()} colleges →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
