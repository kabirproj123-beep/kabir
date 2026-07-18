import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { About } from "@/components/About";
import { Testimonials } from "@/components/Testimonials";
import { Faq } from "@/components/Faq";
import { CtaBand } from "@/components/CtaBand";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: `${site.name} is an education & career consultancy in ${site.location}, guiding students honestly at every step.`,
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow={`About ${site.name}`}
        title="Honest guidance, from the first call to the first job."
        intro={`For ${site.yearsGuiding} years we've done the opposite of the brochure-consultant: read each student's profile honestly and build the whole plan around them.`}
      />

      <About />
      <Testimonials />
      <Faq />
      <CtaBand />
    </>
  );
}
