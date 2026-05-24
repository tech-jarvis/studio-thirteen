import { cookies } from "next/headers";

const ADMIN_COOKIE = "st_admin_session";

export function getAdministrationPassword() {
  return process.env.ADMIN_PASSWORD ?? "admin123";
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE);
  return session?.value === getAdminPassword();
}

export { ADMIN_COOKIE };

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "admin123";
}
