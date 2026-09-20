import { isSiteId } from "@penta/monetization";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;
  const id = site.replace(/\.js$/, "");
  if (!isSiteId(id)) return new NextResponse("// unknown site", { status: 404, headers: { "content-type": "text/javascript" } });
  const origin = new URL(request.url).origin;
  const installation = new URL(request.url).searchParams.get("installation") ?? "";
  const script = `(function(){
  var s=document.currentScript;
  if(!s||!s.parentNode)return;
  var install=${JSON.stringify(installation)};
  var origin=s.getAttribute("data-origin")||document.location.origin;
  var frame=document.createElement("iframe");
  frame.src=${JSON.stringify(origin)}+"/embed/"+${JSON.stringify(id)}+"?installation="+encodeURIComponent(install);
  frame.title=${JSON.stringify(id + " widget")};
  frame.style.width="100%";
  frame.style.minHeight="420px";
  frame.style.border="1px solid currentColor";
  frame.setAttribute("sandbox","allow-scripts allow-forms allow-same-origin");
  frame.setAttribute("data-affiliate","false");
  frame.setAttribute("data-installation",install);
  s.parentNode.insertBefore(frame,s);
})();`;
  return new NextResponse(script, {
    headers: {
      "content-type": "text/javascript; charset=utf-8",
      "cache-control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
