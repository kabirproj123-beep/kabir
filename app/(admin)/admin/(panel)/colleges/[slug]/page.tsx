import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCollege } from "@/lib/collegeStore";
import CollegeForm from "../CollegeForm";
import DeleteCollegeButton from "../DeleteCollegeButton";
import PageHeader from "../../_components/PageHeader";

export const metadata: Metadata = { title: "Edit college" };
export const dynamic = "force-dynamic";

export default async function EditCollegePage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const college = await getCollege(slug);
  if (!college) notFound();

  return (
    <>
      <PageHeader
        title={college.name}
        sub={
          <>
            /colleges/{college.slug}
            {college.updatedAt && (
              <>
                {" · last edited "}
                {new Date(college.updatedAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {college.updatedBy ? ` by ${college.updatedBy}` : ""}
              </>
            )}
          </>
        }
        actions={
          <>
            <Link href={`/colleges/${college.slug}`} className="btn btn-ghost px-3 py-2 text-sm">
              View page
            </Link>
            <Link href="/admin/colleges" className="btn btn-ghost px-3 py-2 text-sm">
              Back
            </Link>
            <DeleteCollegeButton
              slug={college.slug}
              name={college.name}
              label="Delete"
              className="btn border border-danger/40 px-3 py-2 text-sm font-semibold text-danger hover:bg-danger/5 disabled:opacity-40"
            />
          </>
        }
      />
      <div className="p-4 sm:p-6">
        <CollegeForm college={college} mode="edit" listHref="/admin/colleges" />
      </div>
    </>
  );
}
