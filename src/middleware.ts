import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "st_admin_session";

export function middleware(request: NextRequest) {
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
  matcher: ["/admin/:path*"],
};
