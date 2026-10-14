import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/queues", "/settings"];
const authRoutes = ["/login", "/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Protect dashboard routes — require BUSINESS_OWNER or STAFF
  const isProtected = protectedRoutes.some(
    (route) => pathname.startsWith(route) || pathname === route
  );

  if (isProtected) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole !== "BUSINESS_OWNER" && userRole !== "STAFF") {
      return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && authRoutes.includes(pathname)) {
    if (userRole === "BUSINESS_OWNER" || userRole === "STAFF") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/socketio|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
