"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { endSession, requireAdmin } from "@/lib/adminAuth";
import { adminBase, adminHref } from "@/lib/adminNav";
import { createAdmin, deleteAdmin, setAdminPassword } from "@/lib/adminUsers";
import { updateLeadStatus, type LeadStatus, LEAD_STATUSES } from "@/lib/leads";

/**
 * `revalidatePath` takes the internal route path, which is always /admin/… even
 * when the browser is on the admin subdomain. Redirects and links take the
 * public prefix from `adminBase()`. The two are not interchangeable.
 */

export async function logout(): Promise<void> {
  await endSession();
  redirect(adminHref(await adminBase(), "/login"));
}

/* --------------------------------- leads -------------------------------- */

export async function setStatus(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as LeadStatus;
  if (!id || !LEAD_STATUSES.includes(status)) throw new Error("Bad request");

  await updateLeadStatus(id, status);
  revalidatePath("/admin");
}

/* ---------------------------------- team -------------------------------- */

export async function addAdmin(_prev: string | null, formData: FormData): Promise<string | null> {
  await requireAdmin();

  const result = await createAdmin({
    username: String(formData.get("username") ?? ""),
    password: String(formData.get("password") ?? ""),
    name: String(formData.get("name") ?? ""),
  });
  if (!result.ok) return result.error;

  revalidatePath("/admin/team");
  return null;
}

export async function changePassword(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  await requireAdmin();

  const result = await setAdminPassword(
    String(formData.get("username") ?? ""),
    String(formData.get("password") ?? ""),
  );
  if (!result.ok) return result.error;

  revalidatePath("/admin/team");
  return null;
}

export async function removeAdmin(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const me = await requireAdmin();

  const username = String(formData.get("username") ?? "");
  if (username === me.username) return "You can't remove your own account.";

  const result = await deleteAdmin(username);
  if (!result.ok) return result.error;

  revalidatePath("/admin/team");
  return null;
}
