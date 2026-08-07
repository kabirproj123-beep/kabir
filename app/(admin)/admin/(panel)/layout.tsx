import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/adminAuth";
import { adminBase, adminHref, publicSiteHref } from "@/lib/adminNav";
import AdminShell from "./_components/AdminShell";

export const dynamic = "force-dynamic";

/**
 * One gate for every page in the panel. Server Actions are guarded separately —
 * they accept a direct POST and never pass through a layout.
 */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const base = await adminBase();
  const me = await currentAdmin();
  if (!me) redirect(adminHref(base, "/login"));

  return (
    <AdminShell base={base} me={me} publicHref={await publicSiteHref()}>
      {children}
    </AdminShell>
  );
}
