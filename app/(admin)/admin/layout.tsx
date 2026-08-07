import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Kabir admin" },
  robots: { index: false, follow: false },
};

/**
 * Admin canvas. The panel's own chrome lives one level down in (panel), so the
 * sign-in page can render on this background without a sidebar around it.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-paper-2">{children}</div>;
}
