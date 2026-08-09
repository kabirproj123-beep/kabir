import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBar } from "@/components/MobileBar";
import { EnquiryWidget } from "@/components/EnquiryWidget";

/** The public site's chrome. The admin panel is a sibling group and skips it. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBar />
      <EnquiryWidget />
    </div>
  );
}
