import type { Metadata } from "next";
import { listLeads, storageMode } from "@/lib/leads";
import PageHeader from "./_components/PageHeader";
import EnquiriesTable from "./EnquiriesTable";

export const metadata: Metadata = { title: "Enquiries" };
export const dynamic = "force-dynamic";

/**
 * Fetches once and hands the list to a client component. Filtering, searching
 * and paging all happen in the browser from there, so the only trip to the
 * server on this page is this one — and the Server Action behind a status
 * change.
 */
export default async function EnquiriesPage() {
  const leads = await listLeads();

  const today = leads.filter(
    (l) => new Date(l.createdAt).toDateString() === new Date().toDateString(),
  ).length;

  return (
    <>
      <PageHeader
        title="Enquiries"
        sub={
          leads.length === 0
            ? "Leads from every form on the site land here."
            : `${leads.length} total · ${today} today`
        }
      />

      {storageMode() !== "firestore" && (
        <p className="mx-4 mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 sm:mx-6">
          New enquiries aren&apos;t being saved permanently and will be lost on the next update.
          Ask your developer to check the site&apos;s database connection.
        </p>
      )}

      <EnquiriesTable leads={leads} />
    </>
  );
}
