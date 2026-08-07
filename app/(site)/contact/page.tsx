import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to an admission counsellor about Maharashtra colleges. Free, no-obligation, reply within one working day.",
};

export default function ContactPage() {
  return (
    <div className="bg-paper-2">
      <div className="border-b border-line bg-white">
        <div className="container-x py-10">
          <p className="eyebrow">Get in touch</p>
          <h1 className="display-lg mt-2 font-display">Let&apos;s find your best next step</h1>
          <p className="lede mt-3 max-w-2xl">
            Tell us where you are. We&apos;ll come back within one working day with honest next
            steps — no cost, no sales script.
          </p>
        </div>
      </div>

      <div className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-4">
          {[
            { label: "Phone", value: site.phone, href: `tel:${site.whatsapp}` },
            { label: "Email", value: site.email, href: `mailto:${site.email}` },
            { label: "Office", value: site.address },
          ].map((row) => (
            <div key={row.label} className="card p-5">
              <p className="text-xs uppercase tracking-wide text-faint">{row.label}</p>
              {row.href ? (
                <a
                  href={row.href}
                  className="font-display text-lg font-bold text-ink hover:text-brand-700"
                >
                  {row.value}
                </a>
              ) : (
                <p className="font-display text-lg font-bold text-ink">{row.value}</p>
              )}
            </div>
          ))}
        </div>

        <div className="card h-fit border-brand/40 p-5">
          <h2 className="font-display text-lg font-bold">Send us a message</h2>
          <p className="mt-1 mb-4 text-sm text-muted">
            A counsellor will get back to you within one working day.
          </p>
          <LeadForm
            source="contact"
            submitLabel="Send message"
            extraFields={[
              {
                name: "interest",
                label: "What do you need help with?*",
                type: "select",
                required: true,
                options: [
                  "Choosing a college",
                  "Admission / counselling",
                  "Education loan",
                  "Study abroad",
                  "Something else",
                ],
              },
              { name: "message", label: "Your message" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
