import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Matchers for routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/contests(.*)",
  "/problems(.*)",
  "/settings(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // If the route matches the protected routes, enforce authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
