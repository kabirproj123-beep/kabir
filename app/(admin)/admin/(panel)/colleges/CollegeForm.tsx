"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { STREAMS, slugify, type College, type Course, type Faq, type SelectionStep } from "@/lib/colleges";
import { saveCollegeAction } from "./actions";

/* ------------------------------ primitives ------------------------------ */

const INPUT =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-faint";

function Field({
  label,
  hint,
  children,
  wide,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`block ${wide ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-faint">{hint}</span>}
    </label>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

/** Rows of a repeating sub-record (a course, an FAQ, a selection step). */
function Repeater<T>({
  title,
  description,
  items,
  onChange,
  blank,
  addLabel,
  render,
  summary,
}: {
  title: string;
  description?: string;
  items: T[];
  onChange: (next: T[]) => void;
  blank: () => T;
  addLabel: string;
  render: (item: T, set: (patch: Partial<T>) => void) => React.ReactNode;
  summary: (item: T, i: number) => string;
}) {
  const set = (i: number, patch: Partial<T>) =>
    onChange(items.map((it, j) => (i === j ? { ...it, ...patch } : it)));
  const move = (i: number, by: number) => {
    const j = i + by;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">
            {title} <span className="text-sm font-normal text-muted">({items.length})</span>
          </h2>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        <button
          type="button"
          onClick={() => onChange([...items, blank()])}
          className="btn btn-ghost px-3 py-2 text-sm"
        >
          + {addLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-line-strong p-4 text-center text-sm text-muted">
          None yet.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-line bg-paper-2 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted">
                  {i + 1}. {summary(item, i) || "(untitled)"}
                </span>
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                    className="rounded-md border border-line bg-white px-2 py-1 text-xs disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                    aria-label="Move down"
                    className="rounded-md border border-line bg-white px-2 py-1 text-xs disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(items.filter((_, j) => j !== i))}
                    className="rounded-md border border-danger/40 px-2 py-1 text-xs font-semibold text-danger hover:bg-danger/5"
                  >
                    Remove
                  </button>
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {render(item, (patch) => set(i, patch))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* -------------------------------- form ---------------------------------- */

/** One value per line — friendlier than comma-splitting for exam names. */
function linesToList(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function CollegeForm({
  college,
  mode,
  listHref,
}: {
  college: College;
  mode: "new" | "edit";
  /** Where Cancel goes — the panel answers on two URL shapes. */
  listHref: string;
}) {
  const [error, formAction, pending] = useActionState(saveCollegeAction, null);
  const [c, setC] = useState<College>(college);
  // A slug is a permanent URL. Derive it from the name while creating, but stop
  // the moment someone types their own — silently rewriting it later would
  // break inbound links to a published page.
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const set = (patch: Partial<College>) => setC((prev) => ({ ...prev, ...patch }));

  const setName = (name: string) =>
    setC((prev) => ({ ...prev, name, slug: slugTouched ? prev.slug : slugify(name) }));

  // Blank strings are meaningless in the data; store null so "—" renders.
  const text = (key: keyof College) => ({
    value: (c[key] as string | null) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set({ [key]: e.target.value || null } as Partial<College>),
    className: INPUT,
  });

  const number = (key: keyof College) => ({
    value: (c[key] as number | null) ?? "",
    type: "number" as const,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      set({ [key]: e.target.value === "" ? null : Number(e.target.value) } as Partial<College>),
    className: INPUT,
  });

  return (
    <form action={formAction} className="mt-6 space-y-5 pb-28">
      <input type="hidden" name="payload" value={JSON.stringify(c)} />
      <input type="hidden" name="previousSlug" value={mode === "edit" ? college.slug : ""} />

      <Section
        title="Identity"
        description="Name and slug decide the public URL. Everything else is optional."
      >
        <Field label="Name *" wide>
          <input
            required
            value={c.name}
            onChange={(e) => setName(e.target.value)}
            placeholder="College of Engineering, Pune"
            className={INPUT}
          />
        </Field>
        <Field label="Short name" hint="Shown on cards and in the compare tool.">
          <input {...text("short_name")} placeholder="COEP" />
        </Field>
        <Field label="URL slug *" hint={`Public page: /colleges/${c.slug || "…"}`}>
          <input
            required
            value={c.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set({ slug: slugify(e.target.value) });
            }}
            className={INPUT}
          />
        </Field>
        <Field label="City">
          <input {...text("city")} placeholder="Pune" />
        </Field>
        <Field label="State">
          <input {...text("state")} placeholder="Maharashtra" />
        </Field>
        <Field label="Stream *">
          <select
            value={c.stream}
            onChange={(e) => set({ stream: e.target.value as College["stream"] })}
            className={INPUT}
          >
            {STREAMS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Ownership">
          <select
            value={c.ownership ?? ""}
            onChange={(e) => set({ ownership: e.target.value || null })}
            className={INPUT}
          >
            <option value="">—</option>
            <option>Government</option>
            <option>Private</option>
          </select>
        </Field>
        <Field label="Type" hint="Free text, e.g. government, deemed, autonomous.">
          <input {...text("type")} placeholder="government" />
        </Field>
        <Field label="Founded">
          <input {...text("founded")} placeholder="1854" />
        </Field>
        <Field label="Affiliation">
          <input {...text("affiliation")} placeholder="Savitribai Phule Pune University" />
        </Field>
        <Field label="Approved by">
          <input {...text("approved_by")} placeholder="AICTE, UGC" />
        </Field>
        <Field label="NAAC grade">
          <input {...text("naac_grade")} placeholder="A++" />
        </Field>
        <Field label="Tagline" wide>
          <input {...text("tagline")} placeholder="Maharashtra's oldest engineering college" />
        </Field>
      </Section>

      <Section
        title="Ranking & fees"
        description="Fees only appear as a figure when confidence is High — see the note below."
      >
        <Field label="NIRF rank">
          <input {...number("nirf_rank")} placeholder="41" />
        </Field>
        <Field label="Total fee (display text)">
          <input {...text("total_fee")} placeholder="₹3.4 Lakhs" />
        </Field>
        <Field label="Total fee (rupees)" hint="Digits only — used for sorting and filtering.">
          <input {...number("total_fee_value")} placeholder="340000" />
        </Field>
        <Field
          label="Fee confidence"
          hint="Low hides the figure and shows “on request” instead."
        >
          <select
            value={c.fee_confidence ?? "low"}
            onChange={(e) => set({ fee_confidence: e.target.value as "high" | "low" })}
            className={INPUT}
          >
            <option value="low">Low — don&apos;t show a number</option>
            <option value="high">High — verified, safe to show</option>
          </select>
        </Field>
        <Field label="Fee applies to" hint="Which programme the figure covers.">
          <input {...text("fee_course")} placeholder="B.Tech Computer Science (4 years)" />
        </Field>
        <Field label="Fee source" hint="Where the verified figure came from.">
          <input {...text("fee_source")} placeholder="Collegedunia, Aug 2026" />
        </Field>
      </Section>

      <Section title="Placements">
        <Field label="Average package (text)">
          <input {...text("avg_ctc")} placeholder="₹9.5 LPA" />
        </Field>
        <Field label="Average package (rupees)">
          <input {...number("avg_ctc_value")} placeholder="950000" />
        </Field>
        <Field label="Highest package (text)">
          <input {...text("highest_package")} placeholder="₹52 LPA" />
        </Field>
        <Field label="Highest package (rupees)">
          <input {...number("highest_package_value")} placeholder="5200000" />
        </Field>
        <Field label="Placement rate (%)">
          <input {...number("placement_rate")} placeholder="92" />
        </Field>
        <Field label="Placement year">
          <input {...text("placement_year")} placeholder="2025" />
        </Field>
        <Field label="Total offers">
          <input {...text("total_offers")} placeholder="1,240" />
        </Field>
      </Section>

      <Section title="Campus">
        <Field label="Campus size">
          <input {...text("campus_size")} placeholder="36 acres" />
        </Field>
        <Field label="Students">
          <input {...text("student_count")} placeholder="4,000+" />
        </Field>
        <Field label="Faculty">
          <input {...text("faculty_count")} placeholder="250" />
        </Field>
        <Field label="Rating (out of 5)">
          <input {...number("rating")} step="0.1" placeholder="4.3" />
        </Field>
        <Field label="Review count">
          <input {...number("reviews")} placeholder="120" />
        </Field>
        <Field label="Data source" hint="Where this record came from.">
          <input {...text("source")} placeholder="admin" />
        </Field>
        <Field label="Entrance exams" hint="One per line." wide>
          <textarea
            rows={4}
            value={c.entrance_exams.join("\n")}
            onChange={(e) => set({ entrance_exams: linesToList(e.target.value) })}
            placeholder={"JEE Main\nMHT CET"}
            className={INPUT}
          />
        </Field>
        <Field label="Facilities" hint="One per line." wide>
          <textarea
            rows={4}
            value={c.facilities.join("\n")}
            onChange={(e) => set({ facilities: linesToList(e.target.value) })}
            placeholder={"Hostel\nLibrary\nSports complex"}
            className={INPUT}
          />
        </Field>
      </Section>

      <Section title="Written content" description="Shown on the public college page.">
        <Field label="Overview" wide>
          <textarea rows={6} {...text("overview")} />
        </Field>
        <Field label="Why choose this college" wide>
          <textarea rows={5} {...text("why_choose")} />
        </Field>
        <Field label="Admission process" wide>
          <textarea rows={5} {...text("admission_process")} />
        </Field>
        <Field label="Campus life" wide>
          <textarea rows={5} {...text("campus_life")} />
        </Field>
      </Section>

      <Repeater<Course>
        title="Courses & fees"
        description="Each row becomes a line in the courses table."
        items={c.courses}
        onChange={(courses) => set({ courses })}
        blank={() => ({
          name: "",
          duration: null,
          mode: null,
          total_fee: null,
          eligibility: null,
          popular: false,
        })}
        addLabel="Add course"
        summary={(x) => x.name}
        render={(item, setItem) => (
          <>
            <Field label="Course name">
              <input
                value={item.name}
                onChange={(e) => setItem({ name: e.target.value })}
                placeholder="B.Tech Computer Engineering"
                className={INPUT}
              />
            </Field>
            <Field label="Duration">
              <input
                value={item.duration ?? ""}
                onChange={(e) => setItem({ duration: e.target.value || null })}
                placeholder="4 years"
                className={INPUT}
              />
            </Field>
            <Field label="Mode">
              <input
                value={item.mode ?? ""}
                onChange={(e) => setItem({ mode: e.target.value || null })}
                placeholder="Full time"
                className={INPUT}
              />
            </Field>
            <Field label="Total fee">
              <input
                value={item.total_fee ?? ""}
                onChange={(e) => setItem({ total_fee: e.target.value || null })}
                placeholder="₹3.4 Lakhs"
                className={INPUT}
              />
            </Field>
            <Field label="Eligibility">
              <input
                value={item.eligibility ?? ""}
                onChange={(e) => setItem({ eligibility: e.target.value || null })}
                placeholder="10+2 with PCM, MHT CET"
                className={INPUT}
              />
            </Field>
            <Field label="Popular">
              <span className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  checked={item.popular}
                  onChange={(e) => setItem({ popular: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className="text-sm text-muted">Highlight this course</span>
              </span>
            </Field>
          </>
        )}
      />

      <Repeater<SelectionStep>
        title="Selection steps"
        description="The admission journey, in order."
        items={c.selection_steps}
        onChange={(selection_steps) => set({ selection_steps })}
        blank={() => ({ title: "", body: "" })}
        addLabel="Add step"
        summary={(x) => x.title}
        render={(item, setItem) => (
          <>
            <Field label="Step title">
              <input
                value={item.title}
                onChange={(e) => setItem({ title: e.target.value })}
                placeholder="Register for MHT CET"
                className={INPUT}
              />
            </Field>
            <Field label="Details" wide>
              <textarea
                rows={3}
                value={item.body}
                onChange={(e) => setItem({ body: e.target.value })}
                className={INPUT}
              />
            </Field>
          </>
        )}
      />

      <Repeater<Faq>
        title="FAQs"
        items={c.faqs}
        onChange={(faqs) => set({ faqs })}
        blank={() => ({ q: "", a: "" })}
        addLabel="Add FAQ"
        summary={(x) => x.q}
        render={(item, setItem) => (
          <>
            <Field label="Question" wide>
              <input
                value={item.q}
                onChange={(e) => setItem({ q: e.target.value })}
                placeholder="What is the cutoff for CSE?"
                className={INPUT}
              />
            </Field>
            <Field label="Answer" wide>
              <textarea
                rows={3}
                value={item.a}
                onChange={(e) => setItem({ a: e.target.value })}
                className={INPUT}
              />
            </Field>
          </>
        )}
      />

      {/* Sticky so Save is reachable without scrolling to the end of a long form. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur">
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            {error ? (
              <p role="alert" className="text-sm font-medium text-danger">
                {error}
              </p>
            ) : (
              <p className="truncate text-sm text-muted">
                {mode === "new" ? "New college" : c.name} · /colleges/{c.slug || "…"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href={listHref} className="btn btn-ghost px-4 py-2.5 text-sm">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="btn btn-primary px-5 py-2.5 text-sm disabled:opacity-60"
            >
              {pending ? "Saving…" : mode === "new" ? "Create college" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
