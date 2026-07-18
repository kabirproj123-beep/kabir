import { Hero } from "@/components/Hero";
import { TrustStrip } from "@/components/TrustStrip";
import { Services } from "@/components/Services";
import { Approach } from "@/components/Approach";
import { Testimonials } from "@/components/Testimonials";
import { CtaBand } from "@/components/CtaBand";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Services />
      <Approach />
      <Testimonials />
      <CtaBand />
    </>
  );
}
