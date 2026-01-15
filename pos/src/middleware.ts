import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isHomePage = req.nextUrl.pathname === "/";

  // Redirect home to products
  if (isHomePage) {
    return NextResponse.redirect(new URL("/products", req.url));
  }

  // If not authenticated and trying to access protected routes
  if (!token && !isAuthPage) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and trying to access login, redirect to products
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/products", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
