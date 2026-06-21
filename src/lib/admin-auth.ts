import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const ADMIN_COOKIE = "st_admin_session";
const SESSION_LABEL = "studio-thirteen-admin-v1";

/** The configured admin password, or undefined when not set (fail closed). */
function getAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD?.trim() || undefined;
}

/** True when the admin panel has been given a password to check against. */
export function isAdminConfigured(): boolean {
  return Boolean(getAdminPassword());
}

/**
 * Deterministic session token derived from the admin secret. The cookie holds
 * this token — never the password itself — so a leaked cookie does not reveal
 * the password, and rotating ADMIN_PASSWORD / ADMIN_SESSION_SECRET immediately
 * invalidates every existing session.
 */
export function createSessionToken(): string | null {
  const password = getAdminPassword();
  if (!password) return null;
  const secret = process.env.ADMIN_SESSION_SECRET?.trim() || password;
  return createHmac("sha256", secret).update(SESSION_LABEL).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/** Constant-time check of a submitted password against the configured one. */
export function verifyPassword(input: unknown): boolean {
  const password = getAdminPassword();
  if (!password || typeof input !== "string") return false;
  return safeEqual(input, password);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const expected = createSessionToken();
  if (!expected) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return safeEqual(token, expected);
}

export { ADMIN_COOKIE };
