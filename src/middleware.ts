import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "st_admin_session";

function getCanonicalHost() {
  const siteUrl = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return null;
  try {
    return new URL(siteUrl).host;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const canonicalHost = getCanonicalHost();
  const requestHost = request.nextUrl.host;

  // Redirect apex → www (or whatever SITE_URL uses) so one hostname always works
  if (
    canonicalHost &&
    process.env.NODE_ENV === "production" &&
    requestHost !== canonicalHost
  ) {
    const url = request.nextUrl.clone();
    url.host = canonicalHost;
    return NextResponse.redirect(url, 308);
  }

  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";
  const session = request.cookies.get(ADMIN_COOKIE);

  if (pathname.startsWith("/admin") && !isLogin && !session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isLogin && session) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
