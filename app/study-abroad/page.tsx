import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Destinations } from "@/components/Destinations";
import { Approach } from "@/components/Approach";
import { CtaBand } from "@/components/CtaBand";
import { media } from "@/lib/content";

export const metadata: Metadata = {
  title: "Study abroad",
  description:
    "End-to-end study-abroad support across eleven countries — applications, SOPs, scholarships, and visas, handled start to finish.",
};

export default function StudyAbroadPage() {
  return (
    <>
      <PageHeader
        eyebrow="Study abroad"
        title="A campus across the world, chosen with a clear head."
        intro="We're country-agnostic on purpose. From shortlist to visa, we handle the whole application — and only ever point you where the fit is real."
        image={media.studyAbroad}
        imageAlt="A university campus abroad"
      />

      <Destinations />
      <Approach />
      <CtaBand />
    </>
  );
}
