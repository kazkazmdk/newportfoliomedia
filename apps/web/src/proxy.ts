import { NextResponse } from "next/server";
import { globalNoindex, PRELAUNCH_HEADERS } from "@penta/publishing-core";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (!globalNoindex()) return NextResponse.next();
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", PRELAUNCH_HEADERS["X-Robots-Tag"]);
  const url = request.nextUrl;
  if (url.hostname.includes("vercel.app")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
