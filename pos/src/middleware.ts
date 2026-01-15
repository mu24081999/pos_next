import { auth } from "@/auth";

export default auth((req) => {
  // If user is not authenticated and trying to access protected routes, redirect to login
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isPublicRoute = isAuthPage || req.nextUrl.pathname === "/";

  if (!req.auth && !isPublicRoute) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(loginUrl);
  }

  // If user is authenticated and trying to access login, redirect to products
  if (req.auth && isAuthPage) {
    return Response.redirect(new URL("/products", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
