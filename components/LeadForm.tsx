"use client";

/**
 * The lead form. Every gated tool on the site renders one of these.
 *
 * Keep it boring and fast: uncontrolled inputs, one POST, inline success state.
 * The `extraFields` prop covers the per-source questions (income band, course,
 * preferred city) without forking the component.
 */
import { useState, useTransition } from "react";
import type { LeadSource } from "@/lib/leadTypes";

export type ExtraField = {
  name: string;
  label: string;
  type?: "text" | "select";
  options?: string[];
  required?: boolean;
};

export type LeadFormProps = {
  source: LeadSource;
  collegeSlug?: string;
  /** Rendered above the fields. */
  title?: string;
  note?: string;
  submitLabel?: string;
  successTitle?: string;
  successBody?: string;
  extraFields?: ExtraField[];
  /** Values recorded with the lead but not shown to the user. */
  hiddenMeta?: Record<string, string>;
  compact?: boolean;
  /** Fired after a successful submit — used to reveal gated content. */
  onDone?: () => void;
};

export function LeadForm({
  source,
  collegeSlug,
  title,
  note = "Your privacy is protected. Standard terms apply.",
  submitLabel = "Submit",
  successTitle = "Thank you — we've got it.",
  successBody = "A counsellor will call you within 24 hours.",
  extraFields = [],
  hiddenMeta = {},
  compact = false,
  onDone,
}: LeadFormProps) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    const meta: Record<string, string> = { ...hiddenMeta };
    for (const f of extraFields) {
      const v = fd.get(f.name);
      if (v) meta[f.name] = String(v);
    }

    const payload = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? "") || null,
      city: String(fd.get("city") ?? "") || null,
      course: String(fd.get("course") ?? "") || null,
      website: String(fd.get("website") ?? ""), // honeypot
      meta,
      source,
      collegeSlug: collegeSlug ?? null,
    };

    startTransition(async () => {
      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Something went wrong.");
          return;
        }
        setDone(true);
        onDone?.();
      } catch {
        setError("Network error. Please check your connection and try again.");
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-xl border border-line bg-brand-tint/60 p-5 text-center">
        <div
          aria-hidden
          className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-brand-600 text-white"
        >
          ✓
        </div>
        <p className="font-display text-lg font-bold text-ink">{successTitle}</p>
        <p className="mt-1 text-sm text-muted">{successBody}</p>
      </div>
    );
  }

  const input =
    "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink " +
    "placeholder:text-faint focus:border-brand-600";

  return (
    <form onSubmit={onSubmit} className={compact ? "space-y-2.5" : "space-y-3"} noValidate>
      {title && <p className="font-display text-base font-bold text-ink">{title}</p>}

      {/* honeypot — hidden from users, catches naive bots */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] size-0 opacity-0"
      />

      <div className={compact ? "space-y-2.5" : "grid gap-2.5 sm:grid-cols-2"}>
        <input name="name" required placeholder="Full name*" className={input} autoComplete="name" />
        <input
          name="phone"
          required
          inputMode="numeric"
          placeholder="Mobile number*"
          className={input}
          autoComplete="tel"
        />
      </div>

      <input
        name="email"
        type="email"
        placeholder="Email (optional)"
        className={input}
        autoComplete="email"
      />

      {extraFields.map((f) =>
        f.type === "select" ? (
          <select key={f.name} name={f.name} required={f.required} className={input} defaultValue="">
            <option value="" disabled>
              {f.label}
            </option>
            {(f.options ?? []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ) : (
          <input
            key={f.name}
            name={f.name}
            required={f.required}
            placeholder={f.label}
            className={input}
          />
        ),
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary w-full px-4 py-2.5 text-sm disabled:opacity-60">
        {pending ? "Submitting…" : submitLabel}
      </button>

      <p className="text-center text-[0.7rem] leading-snug text-faint">{note}</p>
    </form>
  );
}
