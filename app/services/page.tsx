import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Services } from "@/components/Services";
import { Approach } from "@/components/Approach";
import { CtaBand } from "@/components/CtaBand";
import { JourneyPath } from "@/components/JourneyPath";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Admissions counselling, test prep, study abroad, and career mentorship — everything a student needs, under one roof.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="What we do"
        title="Everything you need, from first choice to first job."
        intro="Four services that only truly work together — the right college, the right score, and the right career are one conversation, not four."
      />

      <Services />

      {/* the journey, visualised */}
      <section className="bg-paper-2/50 border-y border-line py-24 lg:py-32">
        <div className="container-x grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-center">
          <div>
            <p className="eyebrow">The whole way</p>
            <h2 className="display-lg mt-6 text-ink">One path, five decisions.</h2>
            <p className="lede mt-6">
              Every student passes the same handful of forks. We&rsquo;re there for
              each one — so no decision gets made blind, and none gets made alone.
            </p>
          </div>
          <div className="mx-auto max-w-md lg:max-w-none">
            <JourneyPath className="w-full h-auto" />
          </div>
        </div>
      </section>

      <Approach />
      <CtaBand />
    </>
  );
}
