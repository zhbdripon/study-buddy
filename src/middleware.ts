import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/auth", "/api/auth"];

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  const isPublicRoute = publicRoutes.some((route) => {
    return request.nextUrl.pathname.startsWith(route);
  });

  if (!isPublicRoute && !sessionCookie) {
    if (request.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const signInUrl = new URL("/auth/sign-in", request.url);
    return NextResponse.redirect(signInUrl, 302);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|auth|api/auth).*)"],
};
