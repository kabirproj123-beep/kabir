"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { deleteCollege, saveCollege } from "@/lib/collegeStore";

/**
 * The college form holds nested arrays (courses, FAQs, selection steps), which
 * FormData can't represent without inventing a naming convention. The client
 * component posts the whole record as JSON in a single `payload` field instead,
 * and `saveCollege` normalises whatever comes back — the payload is untrusted
 * even though only signed-in admins can reach this action.
 */
export async function saveCollegeAction(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  // Server Actions accept a direct POST regardless of what rendered the form.
  const me = await requireAdmin();

  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return "Couldn't read the form. Please reload the page and try again.";
  }

  const previousSlug = String(formData.get("previousSlug") ?? "") || undefined;
  const result = await saveCollege(payload, { previousSlug, by: me.username });
  if (!result.ok) return result.error;

  // redirect() throws, so it must sit outside the try above.
  redirect(`/admin/colleges?saved=${encodeURIComponent(result.value.slug)}`);
}

export async function deleteCollegeAction(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  await requireAdmin();

  const slug = String(formData.get("slug") ?? "");
  const result = await deleteCollege(slug);
  if (!result.ok) return result.error;

  redirect(`/admin/colleges?deleted=${encodeURIComponent(slug)}`);
}
