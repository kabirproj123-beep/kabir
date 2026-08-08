import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/adminAuth";
import AdminShell from "./_components/AdminShell";

export const dynamic = "force-dynamic";

/**
 * One gate for every page in the panel. Server Actions are guarded separately —
 * they accept a direct POST and never pass through a layout.
 */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const me = await currentAdmin();
  if (!me) redirect("/admin/login");

  return <AdminShell me={me}>{children}</AdminShell>;
}
