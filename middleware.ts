// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/register") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Only check if token cookie exists (no decoding here)
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Let backend /me handle actual verification
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/supplier/:path*", "/admin/:path*"],
};
