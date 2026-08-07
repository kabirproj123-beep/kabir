import type { Metadata } from "next";
import { currentAdmin } from "@/lib/adminAuth";
import { listAdminCredentials } from "@/lib/adminUsers";
import AddAdminForm from "./AddAdminForm";
import AdminRow from "./AdminRow";
import PageHeader from "../_components/PageHeader";

export const metadata: Metadata = { title: "Team" };
export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  // The layout has already established that there's a signed-in admin.
  const [me, admins] = await Promise.all([currentAdmin(), listAdminCredentials()]);

  return (
    <>
      <PageHeader
        title="Team"
        sub={`${admins.length} account${admins.length === 1 ? "" : "s"} can sign in to this panel`}
      />

      <div className="space-y-4 p-4 sm:p-6">
        <AddAdminForm />

        <ul className="card divide-y divide-line overflow-hidden">
          {admins.map((a) => (
            <AdminRow key={a.username} admin={a} isSelf={a.username === me?.username} />
          ))}
        </ul>
      </div>
    </>
  );
}
