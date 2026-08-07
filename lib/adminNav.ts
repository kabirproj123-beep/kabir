import "server-only";
import { headers } from "next/headers";

/**
 * Where admin links point. The panel answers on two shapes — `admin.example.com/team`
 * in production, `localhost:3000/admin/team` in development — so every href and
 * redirect inside the panel is built from this prefix rather than hardcoded.
 *
 * proxy.ts sets the header. Without it (a request that skipped the proxy) the
 * path-based form is the safe default: it works on every host.
 */
export async function adminBase(): Promise<string> {
  return (await headers()).get("x-admin-base") ?? "/admin";
}

/** `adminHref(base, "/team")` → "/admin/team" or "/team". Root is "/" either way. */
export function adminHref(base: string, path = "/"): string {
  if (path === "/") return base || "/";
  return `${base}${path}`;
}

/**
 * The public site, as seen from the panel. On the admin subdomain that's a
 * different host, so a relative link would stay inside the panel.
 */
export async function publicSiteHref(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "";
  const [hostname, port] = host.split(":");
  if (!hostname.startsWith("admin.")) return "/";
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${hostname.slice("admin.".length)}${port ? `:${port}` : ""}`;
}
