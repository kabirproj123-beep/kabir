import { NextResponse, type NextRequest } from "next/server";

/**
 * The admin panel lives on its own hostname — `admin.example.com` — while the
 * routes themselves stay under `app/(admin)/admin`. This rewrites the subdomain
 * onto those routes, so `admin.example.com/colleges` renders `/admin/colleges`
 * without the prefix ever showing in the address bar.
 *
 * Requests carry `x-admin-base`: the prefix admin links must be written with.
 * It's "" on the subdomain and "/admin" elsewhere — see lib/adminNav.ts. Links
 * built any other way break on one host or the other.
 *
 * There's no subdomain on localhost or a bare IP, so there /admin keeps working
 * in place. `admin.localhost:3000` resolves too, if you want to rehearse the
 * production shape.
 */

const ADMIN_SUBDOMAIN = "admin";

/**
 * Set ADMIN_HOST (e.g. "admin.kabir.com") once that hostname actually resolves
 * and is attached to the deployment. Until then /admin is served in place on
 * whatever host it's asked for — redirecting to a subdomain that isn't wired up
 * yet just bounces people to the marketing site.
 */
const ADMIN_HOST = process.env.ADMIN_HOST?.trim().toLowerCase().split(":")[0];

function withBase(req: NextRequest, base: string, rewriteTo?: URL) {
  const headers = new Headers(req.headers);
  headers.set("x-admin-base", base);
  const init = { request: { headers } };
  return rewriteTo ? NextResponse.rewrite(rewriteTo, init) : NextResponse.next(init);
}

/** Hosts with nowhere to put a subdomain: localhost, *.local, 127.0.0.1, IPv6. */
function isBareHost(hostname: string): boolean {
  return (
    !hostname.includes(".") ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    /^[\d.]+$/.test(hostname) ||
    hostname.includes(":")
  );
}

export default function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const [hostname, port] = host.toLowerCase().split(":");
  const { pathname } = req.nextUrl;
  const onAdminHost =
    hostname === ADMIN_HOST ||
    hostname === ADMIN_SUBDOMAIN ||
    hostname.startsWith(`${ADMIN_SUBDOMAIN}.`);

  if (onAdminHost) {
    // admin.example.com/admin/team — someone pasted the old URL. One canonical
    // address per page, so send them to the short form rather than serving both.
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      const canonical = req.nextUrl.clone();
      canonical.pathname = pathname.slice("/admin".length) || "/";
      return NextResponse.redirect(canonical);
    }
    const target = req.nextUrl.clone();
    target.pathname = pathname === "/" ? "/admin" : `/admin${pathname}`;
    return withBase(req, "", target);
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    // Nowhere to send them: no admin hostname configured, or a host that can't
    // have a subdomain (localhost, an IP). Serve the panel where it stands.
    if (!ADMIN_HOST || isBareHost(hostname)) return withBase(req, "/admin");

    const target = req.nextUrl.clone();
    target.host = ADMIN_HOST;
    if (port) target.port = port;
    target.pathname = pathname.slice("/admin".length) || "/";
    return NextResponse.redirect(target);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Everything except Next's own assets and files served from /public.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|gif|svg|webp|ico|css|js|txt|xml|woff2?)$).*)",
  ],
};
