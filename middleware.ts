import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Routes that don't require authentication
const publicRoutes = ["/", "/login", "/register"];
const authRoutes = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  // Always allow auth API routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Allow registration API for non-authed users
  if (nextUrl.pathname === "/api/register") {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Protect non-public routes
  if (!isLoggedIn && !isPublicRoute && !isApiRoute) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  // Enforce onboarding
  if (isLoggedIn) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = req.auth as any;
    const isOnboardingComplete = token?.user?.onboardingComplete === true;
    
    // If not complete, only allow access to /onboarding and related APIs
    if (!isOnboardingComplete && !isPublicRoute && !isApiAuthRoute) {
      if (nextUrl.pathname !== "/onboarding" && nextUrl.pathname !== "/api/onboarding") {
        return NextResponse.redirect(new URL("/onboarding", nextUrl));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"],
};
