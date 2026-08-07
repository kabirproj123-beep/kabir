"use client";

import { useActionState } from "react";
import { bootstrapAdmin } from "./actions";

export default function BootstrapAdminForm() {
  const [error, formAction, pending] = useActionState(bootstrapAdmin, null);

  return (
    <form action={formAction} className="mt-6 space-y-3">
      <input
        type="text"
        name="username"
        required
        autoFocus
        placeholder="Username"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm"
      />
      <input
        type="text"
        name="name"
        required
        placeholder="Full name"
        autoComplete="off"
        className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm"
      />
      <input
        type="password"
        name="password"
        required
        placeholder="Password"
        autoComplete="new-password"
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
        {pending ? "Creating…" : "Create first admin"}
      </button>
    </form>
  );
}