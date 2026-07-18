import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Contact } from "@/components/Contact";
import { Faq } from "@/components/Faq";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book a free, no-obligation counselling session. We reply within one working day.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Let's find your best next step."
        intro="Tell us where you are. We'll come back within one working day with honest next steps — no cost, no sales script."
      />

      <Contact />
      <Faq />
    </>
  );
}
