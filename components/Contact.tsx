"use client";

import { useState } from "react";
import { site } from "@/lib/content";

/**
 * Draft behaviour: the form validates and shows a success state locally without
 * a backend. To go live, POST `payload` to a Next route handler (e.g.
 * /api/enquiry) that writes to Firestore with the admin SDK, or forwards to
 * email. The field names already match a clean enquiry document.
 */
export function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    // Draft stub — swap for a real POST when going live.
    console.info("Enquiry (draft, not sent):", data);
    setTimeout(() => setStatus("sent"), 700);
  }

  return (
    <section id="contact" className="bg-forest text-paper py-24 lg:py-32">
      <div className="container-x grid lg:grid-cols-[0.9fr_1.1fr] gap-14">
        {/* left: invitation + details */}
        <div>
          <p className="eyebrow" style={{ color: "var(--color-terra)" }}>
            Start here
          </p>
          <h2 className="display-lg mt-5 text-paper">
            Book your free counselling session.
          </h2>
          <p className="lede mt-5" style={{ color: "var(--color-cream-dim)" }}>
            Tell us a little about where you are. We&rsquo;ll come back within one
            working day with next steps — no obligation, no sales script.
          </p>

          <dl className="mt-10 space-y-5">
            <ContactRow label="Call or WhatsApp" value={site.phone} href={`tel:${site.whatsapp}`} />
            <ContactRow label="Email" value={site.email} href={`mailto:${site.email}`} />
            <ContactRow label="Visit" value={site.address} />
          </dl>
        </div>

        {/* right: form */}
        <div className="rounded-3xl bg-paper text-ink p-7 sm:p-9">
          {status === "sent" ? (
            <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest text-paper text-2xl">
                ✓
              </div>
              <h3 className="display-md mt-5 text-ink">Thanks — we&rsquo;ve got it.</h3>
              <p className="mt-2 text-moss max-w-xs">
                A counsellor will reach out within one working day.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-5">
              <Field name="name" label="Your name" placeholder="Ananya Rao" required />
              <div className="grid sm:grid-cols-2 gap-5">
                <Field name="email" type="email" label="Email" placeholder="you@email.com" required />
                <Field name="phone" type="tel" label="Phone" placeholder="+91…" required />
              </div>
              <Field name="goal" label="What are you aiming for?" placeholder="e.g. MS in the US, Fall 2026" />
              <label className="grid gap-2">
                <span className="font-display text-sm font-semibold text-ink">Message</span>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Where are you in the process?"
                  className="rounded-xl border border-line bg-paper-2/40 px-4 py-3 text-ink placeholder:text-moss/60 focus:border-forest focus:bg-white outline-none resize-none"
                />
              </label>
              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-terra px-6 py-3.5 font-display text-base font-semibold text-white hover:bg-terra-2 transition-colors disabled:opacity-70"
              >
                {status === "sending" ? "Sending…" : "Request my session"}
              </button>
              <p className="text-xs text-moss">
                This is a draft form — submissions aren&rsquo;t stored yet.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <dt className="font-display text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-terra)" }}>
        {label}
      </dt>
      <dd className="mt-1 text-lg text-paper">
        {href ? (
          <a href={href} className="link-underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function Field({
  name,
  label,
  placeholder,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-display text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-terra"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="rounded-xl border border-line bg-paper-2/40 px-4 py-3 text-ink placeholder:text-moss/60 focus:border-forest focus:bg-white outline-none"
      />
    </label>
  );
}
