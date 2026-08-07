"use client";

import { useState } from "react";

/** Readable and strong: three words plus three digits, ~44 bits of entropy. */
const WORDS = [
  "harbour", "cobalt", "lantern", "meridian", "falcon", "indigo",
  "summit", "quartz", "ember", "pilot", "rally", "vector",
  "monsoon", "kestrel", "atlas", "juniper", "cinder", "orbit",
];

function generate(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const words = [0, 1, 2].map((i) => WORDS[bytes[i] % WORDS.length]);
  return `${words.join("-")}-${100 + (bytes[3] % 900)}`;
}

/**
 * A visible password box with a generator. Deliberately not `type="password"` —
 * whoever fills this in is setting someone else's password and has to be able
 * to read it back to them.
 */
export default function PasswordField({
  name = "password",
  label,
  className = "",
}: {
  name?: string;
  label: string;
  className?: string;
}) {
  const [value, setValue] = useState("");

  return (
    <div className={`flex min-w-0 items-center gap-1.5 ${className}`}>
      <input
        type="text"
        name={name}
        required
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Password"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        aria-label={label}
        className="w-full min-w-0 rounded-lg border border-line bg-white px-3 py-2.5 text-sm"
      />
      <button
        type="button"
        onClick={() => setValue(generate())}
        title="Generate a password"
        className="shrink-0 rounded-lg border border-line px-2.5 py-2 text-xs font-semibold hover:bg-paper-2"
      >
        Generate
      </button>
    </div>
  );
}
