import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";
import { abroadPartners, destinations } from "@/lib/content";

export const metadata: Metadata = {
  title: "Study Abroad — Pathways, Twinning Programmes & Applications",
  description:
    "Study abroad from Maharashtra: direct applications across major destinations, plus twinning and credit-transfer pathways through leading Indian universities.",
};

export default function StudyAbroadPage() {
  return (
    <div className="bg-paper-2">
      <div className="border-b border-line bg-navy text-white">
        <div className="container-x py-12">
          <p className="eyebrow text-brand">Study abroad</p>
          <h1 className="display-lg mt-2 max-w-3xl font-display">
            A degree abroad — directly, or through a pathway
          </h1>
          <p className="mt-3 max-w-2xl text-on-navy-dim">
            There are two honest routes out: apply directly to a foreign university, or start in
            India on a twinning programme and transfer. The second costs far less. We&apos;ll tell
            you which one actually fits your profile and budget.
          </p>
        </div>
      </div>

      <div className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-10">
          <section>
            <h2 className="display-md font-display">Destinations we handle</h2>
            <p className="lede mt-2">
              Applications, SOPs, scholarships and visa documentation, end to end.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.map((d) => (
                <div key={d.code} className="card p-5">
                  <span className="font-display text-2xl font-extrabold text-brand-700">
                    {d.code}
                  </span>
                  <h3 className="mt-1 font-display text-base font-bold text-ink">{d.name}</h3>
                  <p className="text-sm text-muted">{d.note}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="display-md font-display">Twinning &amp; pathway partners in India</h2>
            <p className="lede mt-2">
              Start in India, finish abroad. These universities run credit-transfer and
              semester-abroad routes to foreign degrees — a cheaper way to the same qualification.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {abroadPartners.map((p) => (
                <div key={p.name} className="card p-5">
                  <h3 className="font-display text-base font-bold leading-snug text-ink">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-brand-700">{p.place}</p>
                  <p className="mt-2 text-sm text-muted">{p.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-faint">
              These are outside Maharashtra and are not part of our Maharashtra college database —
              they appear here only as pathway options. Programme availability changes each intake;
              confirm with a counsellor.
            </p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card border-brand/40 p-5">
            <p className="eyebrow">Free assessment</p>
            <h2 className="mt-1 font-display text-lg font-bold">Which route suits you?</h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              Tell us your target country and budget. We&apos;ll be straight with you about the
              trade-offs.
            </p>
            <LeadForm
              source="counselling"
              compact
              submitLabel="Get free assessment"
              hiddenMeta={{ interest: "study-abroad" }}
              extraFields={[
                {
                  name: "destination",
                  label: "Preferred destination*",
                  type: "select",
                  required: true,
                  options: [...destinations.map((d) => d.name), "Not decided yet"],
                },
                {
                  name: "budget",
                  label: "Annual budget*",
                  type: "select",
                  required: true,
                  options: [
                    "Under ₹10 Lakhs",
                    "₹10 – ₹20 Lakhs",
                    "₹20 – ₹35 Lakhs",
                    "Above ₹35 Lakhs",
                  ],
                },
              ]}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
