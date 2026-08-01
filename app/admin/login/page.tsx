"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function AdminLoginPage() {
  const [error, formAction, pending] = useActionState(login, null);

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="display-md font-display">Admin sign in</h1>
        <p className="mt-2 text-sm text-muted">
          Enter the admin password to view enquiries.
        </p>

        <form action={formAction} className="mt-6 space-y-3">
          <input
            type="password"
            name="password"
            required
            autoFocus
            placeholder="Password"
            autoComplete="current-password"
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm"
          />
          {error && (
            <p role="alert" className="text-sm font-medium text-danger">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary w-full px-4 py-2.5 text-sm disabled:opacity-60"
          >
            {pending ? "Checking…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-xs leading-relaxed text-faint">
          Set <code className="rounded bg-paper-3 px-1">ADMIN_PASSWORD</code> in{" "}
          <code className="rounded bg-paper-3 px-1">.env.local</code> (minimum 8 characters)
          to enable this page.
        </p>
      </div>
    </div>
  );
}
