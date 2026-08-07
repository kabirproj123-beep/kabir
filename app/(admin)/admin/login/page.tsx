import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { currentAdmin } from "@/lib/adminAuth";
import { adminBase } from "@/lib/adminNav";
import { countAdmins, isFirebaseConfigured } from "@/lib/adminUsers";
import BootstrapAdminForm from "./BootstrapAdminForm";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

function Card({
  title,
  sub,
  children,
}: {
  title: string;
  sub: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-brand-600 font-display text-lg font-extrabold text-white">
            K
          </span>
          <span>
            <span className="block font-display text-sm font-bold leading-tight">Kabir</span>
            <span className="block text-[0.68rem] uppercase tracking-[0.14em] text-brand-700">
              Admin
            </span>
          </span>
        </div>

        <div className="card mt-5 p-6">
          <h1 className="font-display text-xl font-bold">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{sub}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export default async function AdminLoginPage() {
  if (await currentAdmin()) redirect((await adminBase()) || "/");

  if (!isFirebaseConfigured()) {
    // Anyone can load this page, so it says nothing about how the site is put
    // together. The detail goes to the server log, where it's of use.
    console.error(
      "[admin] Sign-in unavailable: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and " +
        "FIREBASE_PRIVATE_KEY must all be set. Restart after setting them.",
    );
    return <Card title="Sign-in is unavailable" sub="Please try again in a few minutes." />;
  }

  // Open to anyone only while there are no accounts at all — see login/actions.ts.
  if ((await countAdmins()) === 0) {
    return (
      <Card
        title="Create the first admin"
        sub="Choose a username and password. You can add the rest of your team once you're in."
      >
        <BootstrapAdminForm />
      </Card>
    );
  }

  return (
    <Card title="Sign in" sub="Enter your admin username and password.">
      <LoginForm />
      <p className="mt-5 text-xs leading-relaxed text-faint">
        Lost your password? Contact your administrator.
      </p>
    </Card>
  );
}
