import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { LeadForm } from "@/components/LeadForm";
import { CollegeCard } from "@/components/CollegeCard";
import { Carousel, Slide } from "@/components/Carousel";
import { Reveal } from "@/components/Motion";
import { creditLine, getImage } from "@/lib/images";
import { formatINR, formatLPA, hasVerifiedFee } from "@/lib/colleges";
import { getAllColleges, getCollege, relatedColleges } from "@/lib/collegeStore";

export async function generateStaticParams() {
  return (await getAllColleges()).map((c) => ({ slug: c.slug }));
}

/**
 * Colleges are editable from /admin, so a slug that didn't exist at build time
 * still has to render. Next's default of blocking unknown params would 404 a
 * college the moment it was added.
 */
export const dynamicParams = true;

/** `params` is a Promise in Next 16. */
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const c = await getCollege(slug);
  if (!c) return { title: "College not found" };

  const bits = [
    hasVerifiedFee(c) ? `${formatINR(c.total_fee_value)} total fees` : null,
    c.avg_ctc_value ? `${formatLPA(c.avg_ctc_value)} average package` : null,
  ].filter(Boolean);

  return {
    title: `${c.short_name || c.name}, ${c.city} — Admissions, Fees & Placements`,
    description:
      `${c.name} in ${c.city}, Maharashtra. ` +
      (bits.length ? `Check ${bits.join(", ")}, ` : "") +
      `courses, admission process and cutoffs.`,
  };
}

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "admission", label: "Admission" },
  { id: "courses", label: "Courses & Fees" },
  { id: "placements", label: "Placements" },
  { id: "faq", label: "FAQs" },
];

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="font-display text-xl font-extrabold text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  );
}

export default async function CollegeDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const c = await getCollege(slug);
  if (!c) notFound();

  const img = getImage(c.slug);
  const feeVerified = hasVerifiedFee(c);
  const related = await relatedColleges(c);
  const factSheet = [
    ["Founded", c.founded],
    ["Affiliation", c.affiliation],
    ["Ownership", c.ownership],
    ["Campus", c.campus_size],
    ["Students", c.student_count],
    ["Faculty", c.faculty_count],
    ["NAAC", c.naac_grade],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="bg-paper-2">
      {/* ---------------- hero ---------------- */}
      <div className="relative border-b border-line bg-navy text-white">
        {img && (
          <>
            <Image
              src={img.src}
              alt={`${c.short_name || c.name} campus`}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-25"
            />
            {/* the copy sits on top, so the photo needs to stay well behind it */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/60"
            />
          </>
        )}
        <div className="container-x relative py-8 md:py-10">
          <nav className="mb-4 text-xs text-on-navy-dim" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <Link href="/colleges" className="hover:text-white">
              Colleges
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-white">{c.short_name || c.name}</span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="display-lg font-display">{c.name}</h1>
              <p className="mt-2 text-on-navy-dim">
                {c.city}, Maharashtra
                {c.approved_by ? ` · Approved by ${c.approved_by}` : ""}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="chip chip-brand">{c.stream}</span>
                {c.ownership && <span className="chip">{c.ownership}</span>}
                {c.nirf_rank ? <span className="chip">NIRF #{c.nirf_rank}</span> : null}
                {c.naac_grade && <span className="chip">NAAC {c.naac_grade}</span>}
                {c.rating ? (
                  <span className="chip">
                    ★ {c.rating} ({c.reviews} reviews)
                  </span>
                ) : null}
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
              <div className="rounded-xl border border-line-navy bg-navy-2/80 p-3.5 backdrop-blur-sm sm:p-4">
                <p className="font-display text-base font-extrabold sm:text-lg">
                  {feeVerified ? formatINR(c.total_fee_value) : "On request"}
                </p>
                <p className="text-xs text-on-navy-dim">
                  {feeVerified && c.fee_course
                    ? `Total · ${c.fee_course.slice(0, 28)}`
                    : "Total fees"}
                </p>
              </div>
              <div className="rounded-xl border border-line-navy bg-navy-2/80 p-3.5 backdrop-blur-sm sm:p-4">
                <p className="font-display text-base font-extrabold sm:text-lg">
                  {formatLPA(c.avg_ctc_value)}
                </p>
                <p className="text-xs text-on-navy-dim">Avg package</p>
              </div>
            </div>
          </div>

          {img && (
            <p className="mt-5 text-[0.68rem] text-on-navy-dim/70">{creditLine(img)}</p>
          )}
        </div>
      </div>

      {/* ---------------- section nav ---------------- */}
      <div className="sticky top-16 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="container-x flex gap-1 overflow-x-auto py-2">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-muted hover:bg-paper-2 hover:text-ink"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      <div className="container-x grid gap-8 py-8 lg:grid-cols-[1fr_20rem]">
        {/* ---------------- main ---------------- */}
        <div className="space-y-6">
          <section id="overview" className="card p-6">
            <h2 className="display-md font-display">
              {c.tagline ? `${c.short_name || c.name}: ${c.tagline}` : "Overview"}
            </h2>
            {c.overview?.split("\n\n").map((p, i) => (
              <p key={i} className="mt-3 text-[0.95rem] leading-relaxed text-muted">
                {p}
              </p>
            ))}

            {(c.faculty_count || c.student_count) && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {c.faculty_count && <Stat label="Faculty" value={c.faculty_count} />}
                {c.student_count && <Stat label="Students" value={c.student_count} />}
                {c.campus_size && <Stat label="Campus" value={c.campus_size} />}
                {c.founded && <Stat label="Founded" value={c.founded} />}
              </div>
            )}

            {c.facilities.length > 0 && (
              <div className="mt-5">
                <h3 className="font-display text-sm font-bold uppercase tracking-wide text-faint">
                  Key facilities
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.facilities.map((f) => (
                    <span key={f} className="chip">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {c.why_choose && (
            <section className="card p-6">
              <h2 className="display-md font-display">Why choose {c.short_name || c.name}</h2>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{c.why_choose}</p>
            </section>
          )}

          <section id="admission" className="card p-6">
            <h2 className="display-md font-display">Admission process</h2>
            {c.admission_process ? (
              c.admission_process.split("\n\n").map((p, i) => (
                <p key={i} className="mt-3 text-[0.95rem] leading-relaxed text-muted">
                  {p}
                </p>
              ))
            ) : (
              <p className="mt-3 text-[0.95rem] text-muted">
                Admission is through the relevant entrance exam followed by centralised
                counselling. Talk to a counsellor for the current cycle&apos;s dates and cutoffs.
              </p>
            )}

            {c.entrance_exams.length > 0 && (
              <div className="mt-4">
                <h3 className="font-display text-sm font-bold uppercase tracking-wide text-faint">
                  Accepted entrance exams
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.entrance_exams.map((e) => (
                    <span key={e} className="chip chip-brand">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {c.selection_steps.length > 0 && (
              <ol className="mt-5 space-y-3">
                {c.selection_steps.map((s, i) => (
                  <li key={s.title} className="flex gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-display text-sm font-bold text-ink">{s.title}</p>
                      <p className="text-sm text-muted">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {c.courses.length > 0 && (
            <section id="courses" className="card overflow-hidden">
              <div className="p-6 pb-4">
                <h2 className="display-md font-display">Courses &amp; fees</h2>
                <p className="mt-1 text-sm text-muted">
                  {c.courses.length} programme{c.courses.length === 1 ? "" : "s"} listed.
                </p>
                {feeVerified ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    ✓ Headline fee cross-checked against a second source
                    {c.fee_course ? ` (${c.fee_course})` : ""}
                  </p>
                ) : (
                  <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
                    We couldn&apos;t verify this college&apos;s fees against a second source, so
                    we&apos;re not publishing a headline figure. The per-course figures below come
                    from the college listing and may be out of date — confirm with the admission
                    office or ask a counsellor.
                  </p>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="dtable min-w-[38rem]">
                  <thead>
                    <tr>
                      <th>Programme</th>
                      <th>Total fees</th>
                      <th>Eligibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.courses.map((course, i) => (
                      <tr key={`${course.name}-${i}`}>
                        <td>
                          <p className="font-semibold text-ink">
                            {course.name}
                            {course.popular && (
                              <span className="chip chip-brand ms-2">Popular</span>
                            )}
                          </p>
                          <p className="text-xs text-muted">
                            {[course.duration, course.mode].filter(Boolean).join(" · ")}
                          </p>
                        </td>
                        <td className="whitespace-nowrap font-semibold text-ink">
                          {course.total_fee ?? "—"}
                        </td>
                        <td className="text-sm text-muted">{course.eligibility ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section id="placements" className="card p-6">
            <h2 className="display-md font-display">
              Placements {c.placement_year && <span className="text-muted">{c.placement_year}</span>}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Average package" value={formatLPA(c.avg_ctc_value)} />
              <Stat label="Highest package" value={formatLPA(c.highest_package_value)} />
              <Stat
                label="Placement rate"
                value={c.placement_rate ? `${c.placement_rate}%` : "—"}
              />
              <Stat label="Total offers" value={c.total_offers ?? "—"} />
            </div>
            <p className="mt-3 text-xs text-faint">
              Compiled from college disclosures and NIRF reports. Verify current figures with the
              admission office before deciding.
            </p>
          </section>

          {c.campus_life && (
            <section className="card p-6">
              <h2 className="display-md font-display">Campus life</h2>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{c.campus_life}</p>
            </section>
          )}

          {c.faqs.length > 0 && (
            <section id="faq" className="card p-6">
              <h2 className="display-md font-display">Frequently asked questions</h2>
              <div className="mt-4 divide-y divide-line">
                {c.faqs.map((f) => (
                  <details key={f.q} className="group py-3">
                    <summary className="cursor-pointer list-none font-display text-[0.95rem] font-bold text-ink marker:content-none">
                      {f.q}
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ---------------- sidebar ---------------- */}
        <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <div className="card border-brand/40 bg-white p-5">
            <p className="eyebrow">Admission help</p>
            <h3 className="mt-1 font-display text-lg font-bold">
              Get guidance for {c.short_name || c.name}
            </h3>
            <p className="mt-1 mb-4 text-sm text-muted">
              Free counselling on eligibility, cutoffs and the application timeline.
            </p>
            <LeadForm
              source="college-enquiry"
              collegeSlug={c.slug}
              compact
              submitLabel="Request a callback"
              hiddenMeta={{ college: c.name, stream: c.stream }}
              extraFields={[
                {
                  name: "programme",
                  label: "Programme of interest",
                  type: "select",
                  options: c.courses.length
                    ? [...new Set(c.courses.map((x) => x.name))].slice(0, 10)
                    : [c.stream],
                },
              ]}
            />
          </div>

          {factSheet.length > 0 && (
            <div className="card p-5">
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-faint">
                Fact sheet
              </h3>
              <dl className="mt-3 divide-y divide-line text-sm">
                {factSheet.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 py-2">
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-end font-semibold text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <div className="container-x pb-12">
          <Reveal>
            <h2 className="display-md font-display">Similar colleges</h2>
            <p className="mt-1 text-sm text-muted">
              Other {c.stream.toLowerCase()} colleges, nearest first.
            </p>
            <Carousel ariaLabel="Similar colleges" className="mt-4">
              {related.map((r) => (
                <Slide key={r.slug}>
                  <CollegeCard college={r} />
                </Slide>
              ))}
            </Carousel>
          </Reveal>
        </div>
      )}
    </div>
  );
}
