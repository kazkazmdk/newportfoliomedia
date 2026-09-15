import { NextResponse } from "next/server";
import { globalNoindex, PRELAUNCH_HEADERS } from "@penta/publishing-core";
import type { NextRequest } from "next/server";
import { previewProduct } from "@/lib/preview-product";

export function proxy(request: NextRequest) {
  const product = previewProduct();
  const url = request.nextUrl;
  if (product && url.pathname === "/") {
    const dest = url.clone();
    dest.pathname = `/${product}`;
    return NextResponse.redirect(dest);
  }
  if (!globalNoindex()) return NextResponse.next();
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", PRELAUNCH_HEADERS["X-Robots-Tag"]);
  if (url.hostname.includes("vercel.app")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
