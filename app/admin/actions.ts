"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, isAdmin, signToken, verifyPassword } from "@/lib/adminAuth";
import { updateLeadStatus, type LeadStatus, LEAD_STATUSES } from "@/lib/leads";

export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(password)) {
    return "Incorrect password.";
  }
  const token = signToken();
  if (!token) return "Admin access is not configured on this server.";

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export async function setStatus(formData: FormData): Promise<void> {
  // Server Actions are reachable by direct POST — re-check auth here, not just
  // in the page that renders the button.
  if (!(await isAdmin())) throw new Error("Unauthorized");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as LeadStatus;
  if (!id || !LEAD_STATUSES.includes(status)) throw new Error("Bad request");

  await updateLeadStatus(id, status);
  revalidatePath("/admin");
}
