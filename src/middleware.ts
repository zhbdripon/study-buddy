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
      return NextResponse.json({ error: "Unauthorized" }, { status: 400 });
    }

    console.log("Progress", request.nextUrl.pathname);

    const signInUrl = new URL("/auth/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
