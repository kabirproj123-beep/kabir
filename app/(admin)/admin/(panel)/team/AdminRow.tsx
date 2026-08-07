"use client";

import { useActionState, useState } from "react";
import { changePassword, removeAdmin } from "../actions";
import PasswordField from "./PasswordField";

export type RowAdmin = {
  username: string;
  name: string;
  createdAt: string;
  lastLoginAt: string | null;
  /** null only for an account still holding a hash from the old scheme. */
  password: string | null;
};

function fmt(iso: string | null) {
  if (!iso) return "never";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Password({ value, username }: { value: string | null; username: string }) {
  const [copied, setCopied] = useState(false);

  if (value === null) {
    return (
      <span className="text-xs text-faint">
        Not readable — set a new one below, or it appears after {username} next signs in
      </span>
    );
  }

  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <code className="truncate rounded-md bg-paper-3 px-2 py-1 text-sm text-ink">{value}</code>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(`${username} / ${value}`);
          setCopied(true);
        }}
        className="shrink-0 rounded-md border border-line px-2 py-1 text-[0.68rem] font-semibold hover:bg-paper-2"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}

export default function AdminRow({ admin, isSelf }: { admin: RowAdmin; isSelf: boolean }) {
  const [pwError, pwAction, pwPending] = useActionState(changePassword, null);
  const [removeError, removeAction, removePending] = useActionState(removeAdmin, null);
  const error = pwError ?? removeError;

  return (
    <li className="p-4 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-ink">
            {admin.name}
            {isSelf && <span className="chip chip-brand ml-1.5">you</span>}
          </p>
          <p className="text-xs text-muted">@{admin.username}</p>
        </div>
        <p className="text-xs text-muted">
          Added {fmt(admin.createdAt)} · Last sign-in{" "}
          <span className={admin.lastLoginAt ? "" : "text-faint"}>{fmt(admin.lastLoginAt)}</span>
        </p>
      </div>

      <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-faint">Password</span>
        <Password value={admin.password} username={admin.username} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <form action={pwAction} className="flex flex-1 items-center gap-1.5">
          <input type="hidden" name="username" value={admin.username} />
          <PasswordField
            label={`New password for ${admin.username}`}
            className="flex-1 sm:max-w-xs"
          />
          <button
            disabled={pwPending}
            className="shrink-0 rounded-lg border border-line px-2.5 py-2 text-xs font-semibold hover:bg-paper-2 disabled:opacity-60"
          >
            {pwPending ? "Setting…" : "Set password"}
          </button>
        </form>

        <form action={removeAction}>
          <input type="hidden" name="username" value={admin.username} />
          <button
            disabled={removePending || isSelf}
            title={isSelf ? "You can't remove your own account" : undefined}
            className="rounded-lg border border-danger/40 px-2.5 py-1.5 text-xs font-semibold text-danger hover:bg-danger/5 disabled:opacity-40"
          >
            Remove
          </button>
        </form>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </li>
  );
}
