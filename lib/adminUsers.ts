/**
 * Admin accounts — documents in the Firestore `admins` collection.
 *
 * No local-file fallback: without Firestore the panel refuses to open rather
 * than authenticating against a different store than production uses.
 */
import "server-only";
import { getAdminDb, isFirebaseConfigured } from "./firebaseAdmin";
import { isHashed, verifyPassword } from "./password";

export { isFirebaseConfigured };

export type Admin = {
  username: string;
  /**
   * The password as typed. Stored in the clear so the Team page can show it to
   * whoever needs to pass it on.
   */
  password: string;
  name: string;
  createdAt: string;
  lastLoginAt: string | null;
};

/** What most pages get — the password is only sent where it's displayed. */
export type AdminSummary = Omit<Admin, "password">;

export type Result<T = void> = { ok: true; value: T } | { ok: false; error: string };

export const NOT_CONFIGURED =
  "Firebase is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and " +
  "FIREBASE_PRIVATE_KEY, then restart the server.";

function admins() {
  const db = getAdminDb();
  if (!db) throw new Error(NOT_CONFIGURED);
  return db.collection("admins");
}

/** Usernames are the document id, so: lowercase, no slashes. */
export function normaliseUsername(input: string): string | null {
  const u = String(input ?? "").trim().toLowerCase();
  return /^[a-z0-9][a-z0-9._@-]{2,63}$/.test(u) ? u : null;
}

function strip(admin: Admin): AdminSummary {
  const { username, name, createdAt, lastLoginAt } = admin;
  return { username, name, createdAt, lastLoginAt };
}

export async function listAdmins(): Promise<AdminSummary[]> {
  const snap = await admins().get();
  return snap.docs
    .map((d) => d.data() as Admin)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map(strip);
}

/**
 * The same list with passwords attached, for the Team page. Every signed-in
 * admin can read every account's password — there are no roles here, so this is
 * open to anyone who can reach the panel. Call it only behind `requireAdmin()`.
 *
 * An account left over from when passwords were hashed reads as null: the digest
 * can't be reversed. Its owner's next sign-in replaces it, or set a new one.
 */
export async function listAdminCredentials(): Promise<
  (AdminSummary & { password: string | null })[]
> {
  const snap = await admins().get();
  return snap.docs
    .map((d) => d.data() as Admin)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((a) => ({ ...strip(a), password: isHashed(a.password) ? null : a.password }));
}

export async function countAdmins(): Promise<number> {
  return (await admins().count().get()).data().count;
}

export async function getAdmin(username: string): Promise<AdminSummary | null> {
  const u = normaliseUsername(username);
  if (!u) return null;
  const snap = await admins().doc(u).get();
  return snap.exists ? strip(snap.data() as Admin) : null;
}

export async function createAdmin(input: {
  username: string;
  password: string;
  name?: string;
}): Promise<Result<AdminSummary>> {
  const username = normaliseUsername(input.username);
  if (!username) {
    return { ok: false, error: "Username must be 3–64 characters: a–z, 0–9, . _ - or @." };
  }
  if (!input.password) return { ok: false, error: "Password can't be empty." };

  const admin: Admin = {
    username,
    password: input.password,
    name: (input.name ?? "").trim().slice(0, 80) || username,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };

  try {
    // create() rejects if the document exists, so two people can't claim the
    // same username at once.
    await admins().doc(username).create(admin);
  } catch {
    return { ok: false, error: `An admin named "${username}" already exists.` };
  }
  return { ok: true, value: strip(admin) };
}

export async function setAdminPassword(username: string, password: string): Promise<Result> {
  const u = normaliseUsername(username);
  if (!u || !(await admins().doc(u).get()).exists) return { ok: false, error: "No such admin." };
  if (!password) return { ok: false, error: "Password can't be empty." };

  await admins().doc(u).update({ password });
  return { ok: true, value: undefined };
}

export async function deleteAdmin(username: string): Promise<Result> {
  const u = normaliseUsername(username);
  if (!u) return { ok: false, error: "No such admin." };
  // Losing the last account locks everyone out of the panel.
  if ((await countAdmins()) <= 1) {
    return { ok: false, error: "Can't remove the only admin account." };
  }

  await admins().doc(u).delete();
  return { ok: true, value: undefined };
}

export async function authenticate(
  usernameInput: string,
  password: string,
): Promise<Result<AdminSummary>> {
  const username = normaliseUsername(usernameInput);
  const snap = username ? await admins().doc(username).get() : null;
  const admin = snap?.exists ? (snap.data() as Admin) : null;

  // Same message either way — don't reveal which usernames exist.
  if (!admin || !password || !(await verifyPassword(password, admin.password))) {
    return { ok: false, error: "Incorrect username or password." };
  }

  const lastLoginAt = new Date().toISOString();
  // A correct sign-in is the only way to recover the password behind an old
  // hash, so take it — after this the account shows up on the Team page.
  const patch: Partial<Admin> = { lastLoginAt };
  if (isHashed(admin.password)) patch.password = password;

  await admins().doc(admin.username).update(patch);
  return { ok: true, value: strip({ ...admin, lastLoginAt }) };
}
