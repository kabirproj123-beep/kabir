import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";
import { getAllColleges } from "@/lib/collegeStore";

export const metadata: Metadata = {
  title: "Free Admission Counselling — Maharashtra CET, JEE, NEET & CLAT",
  description:
    "Free counselling for Maharashtra admissions: choice filling, cutoff strategy, category certificates and management-quota guidance.",
};

const DOMAINS = [
  {
    title: "MHT-CET & state counselling",
    body: "Choice filling for Maharashtra engineering and pharmacy seats, with domicile and category advantages worked into your preference list.",
    points: ["State rank optimisation", "Domicile benefits", "Round-wise strategy", "Fee structure audit"],
  },
  {
    title: "JEE / JoSAA guidance",
    body: "Preference lists for IITs, NITs and IIITs built around branch-versus-college trade-offs rather than guesswork.",
    points: ["IIT/NIT prioritisation", "Branch vs college", "CSAB special rounds", "Seat upgrade tracking"],
  },
  {
    title: "NEET & medical admissions",
    body: "All India Quota and Maharashtra state quota support for MBBS and BDS, including deemed universities.",
    points: ["AIQ vs state quota", "Deemed university audit", "Category matching", "Document verification"],
  },
  {
    title: "Law admissions",
    body: "CLAT and MH CET Law counselling across national law universities and Maharashtra's government law colleges.",
    points: ["NLU preference lists", "MH CET Law strategy", "Five-year vs three-year", "Private college quotas"],
  },
  {
    title: "MBA admissions",
    body: "CAT and MAH MBA CET guidance across Maharashtra's business schools, mapped to your percentile and budget.",
    points: ["Percentile mapping", "GD/PI preparation", "ROI comparison", "Institute shortlisting"],
  },
  {
    title: "Category & document audit",
    body: "Making sure EWS, OBC-NCL and SC/ST certificates are valid and in the current format before the window closes.",
    points: ["NCL validity check", "Format verification", "Correction window help", "Affidavit preparation"],
  },
];

export default async function CounsellingPage() {
  const total = (await getAllColleges()).length;

  return (
    <div className="bg-paper-2">
      <div className="border-b border-line bg-navy text-white">
        <div className="container-x py-12">
          <p className="eyebrow text-brand">Counselling</p>
          <h1 className="display-lg mt-2 max-w-3xl font-display">
            Get your choice list right the first time
          </h1>
          <p className="mt-3 max-w-2xl text-on-navy-dim">
            Choice filling is where good ranks get wasted. We map your rank and category against{" "}
            {total} Maharashtra colleges and build a preference list that protects your best
            realistic outcome.
          </p>
        </div>
      </div>

      <div className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_22rem]">
        <div className="grid gap-4 sm:grid-cols-2">
          {DOMAINS.map((d) => (
            <div key={d.title} className="card p-6">
              <h2 className="font-display text-lg font-bold text-ink">{d.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d.body}</p>
              <ul className="mt-3 space-y-1.5">
                {d.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-muted">
                    <span aria-hidden className="mt-0.5 text-success">
                      ✓
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card border-brand/40 p-5">
            <p className="eyebrow">Free session</p>
            <h2 className="mt-1 font-display text-lg font-bold">Book free counselling</h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              Tell us your exam and score. A counsellor will call within 24 hours.
            </p>
            <LeadForm
              source="counselling"
              compact
              submitLabel="Book my free session"
              extraFields={[
                {
                  name: "exam",
                  label: "Which exam?*",
                  type: "select",
                  required: true,
                  options: [
                    "MHT-CET",
                    "JEE Main / Advanced",
                    "NEET UG",
                    "CAT / MAH MBA CET",
                    "CLAT / MH CET Law",
                    "Not decided yet",
                  ],
                },
                { name: "score", label: "Score / rank / percentile (if known)" },
              ]}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
