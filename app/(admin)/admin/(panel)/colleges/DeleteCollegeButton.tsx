"use client";

import { useActionState } from "react";
import { deleteCollegeAction } from "./actions";

/**
 * Deleting a college takes its public page down, so it asks first. `confirm`
 * runs before submit; returning false from onSubmit cancels the action.
 */
export default function DeleteCollegeButton({
  slug,
  name,
  className = "rounded-md border border-danger/40 px-2 py-1 text-xs font-semibold text-danger hover:bg-danger/5 disabled:opacity-40",
  label = "Delete",
}: {
  slug: string;
  name: string;
  className?: string;
  label?: string;
}) {
  const [error, formAction, pending] = useActionState(deleteCollegeAction, null);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`Delete "${name}"? Its page at /colleges/${slug} will stop working.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <button disabled={pending} className={className}>
        {pending ? "Deleting…" : label}
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
