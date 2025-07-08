import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["sign-in", "sign-up", "/api/auth"];

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  const isPublicRoute = publicRoutes.some((route) => {
    return request.nextUrl.pathname.startsWith(route);
  });

  if (!isPublicRoute && !sessionCookie) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/(api|trpc)(.*)"],
};
