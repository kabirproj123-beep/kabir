import Link from "next/link";
import type { Metadata } from "next";
import { emptyCollege } from "@/lib/colleges";
import CollegeForm from "../CollegeForm";
import PageHeader from "../../_components/PageHeader";

export const metadata: Metadata = { title: "Add a college" };
export const dynamic = "force-dynamic";

export default async function NewCollegePage() {
  return (
    <>
      <PageHeader
        title="Add a college"
        sub="Name, slug and stream are required. Everything else can wait."
        actions={
          <Link href="/admin/colleges" className="btn btn-ghost px-3 py-2 text-sm">
            Back to colleges
          </Link>
        }
      />
      <div className="p-4 sm:p-6">
        <CollegeForm college={emptyCollege()} mode="new" listHref="/admin/colleges" />
      </div>
    </>
  );
}
