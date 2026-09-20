import { NextResponse } from "next/server";
import { isSiteId } from "@penta/monetization";

export async function GET(request: Request, { params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;
  const id = site.replace(/\.js$/, "");
  if (!isSiteId(id)) {
    return new NextResponse("// unknown site", { status: 404, headers: { "content-type": "text/javascript" } });
  }
  const origin = new URL(request.url).origin;
  const script = `(function(){
  var s=document.currentScript;
  if(!s||!s.parentNode)return;
  var frame=document.createElement("iframe");
  frame.src=${JSON.stringify(`${origin}/embed/${id}`)};
  frame.title=${JSON.stringify(`${id} widget`)};
  frame.style.width="100%";
  frame.style.minHeight="420px";
  frame.style.border="1px solid currentColor";
  frame.setAttribute("data-affiliate","false");
  s.parentNode.insertBefore(frame,s);
})();`;
  return new NextResponse(script, {
    headers: {
      "content-type": "text/javascript; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
