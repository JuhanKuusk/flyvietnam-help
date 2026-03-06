import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Extract clean domain (without port)
  const domain = hostname.split(":")[0].replace(/^www\./, "").toLowerCase();

  // Create response
  let response = NextResponse.next();

  // Tours routes should only be accessible on vietnamtravel.help and flyvietnam.help
  if (pathname.startsWith("/tours") || pathname.startsWith("/cruise")) {
    // Allow on vietnamtravel.help, flyvietnam.help, or localhost (for development)
    const isVietnamTravelHelp = hostname.includes("vietnamtravel.help");
    const isFlyVietnamHelp = hostname.includes("flyvietnam.help");
    const isLocalhost = hostname.includes("localhost") || hostname.includes("127.0.0.1");

    if (!isVietnamTravelHelp && !isFlyVietnamHelp && !isLocalhost) {
      // Redirect to homepage if trying to access tours from other domains
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Set site-domain cookie for client-side detection
  response.cookies.set("site-domain", domain, {
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
    sameSite: "lax",
  });

  // Also set header for server-side detection
  response.headers.set("x-site-domain", domain);

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
