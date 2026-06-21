import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createSessionToken,
  verifyPassword,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const token = createSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "Admin login is not configured" },
      { status: 500 }
    );
  }

  const { password } = await request.json();

  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  const cookieOptions: Parameters<typeof response.cookies.set>[2] = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };
  const cookieDomain = process.env.COOKIE_DOMAIN?.trim();
  if (cookieDomain) {
    cookieOptions.domain = cookieDomain;
  }
  response.cookies.set(ADMIN_COOKIE, token, cookieOptions);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  const cookieDomain = process.env.COOKIE_DOMAIN?.trim();
  if (cookieDomain) {
    response.cookies.set(ADMIN_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      domain: cookieDomain,
      maxAge: 0,
    });
  } else {
    response.cookies.delete(ADMIN_COOKIE);
  }
  return response;
}
