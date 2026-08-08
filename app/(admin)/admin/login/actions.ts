"use server";

import { redirect } from "next/navigation";
import { startSession } from "@/lib/adminAuth";
import { authenticate, countAdmins, createAdmin } from "@/lib/adminUsers";

export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
  const result = await authenticate(
    String(formData.get("username") ?? ""),
    String(formData.get("password") ?? ""),
  );
  if (!result.ok) return result.error;

  await startSession(result.value.username);
  redirect("/admin");
}

/**
 * Only reachable while the `admins` collection is empty — otherwise anyone could
 * mint themselves an account. Re-checked here because a Server Action accepts a
 * direct POST no matter what the page rendered.
 */
export async function bootstrapAdmin(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  if ((await countAdmins()) !== 0) return "An admin already exists. Sign in instead.";

  const result = await createAdmin({
    username: String(formData.get("username") ?? ""),
    password: String(formData.get("password") ?? ""),
    name: String(formData.get("name") ?? ""),
  });
  if (!result.ok) return result.error;

  await startSession(result.value.username);
  redirect("/admin");
}
