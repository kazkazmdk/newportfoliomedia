import { NextResponse } from "next/server";
import { isSiteId } from "@penta/monetization";
import { issueLocalKey, publicKeyView } from "@penta/platform-api";
import { readJsonBody } from "@/lib/read-json";
import { mutateStore, readStore } from "@/lib/platform-store";
import { limited, recordEvent, requireKey } from "@/lib/v1";

export async function GET(request: Request) {
  const blocked = limited(request, "v1-keys-get", 30);
  if (blocked) return blocked;
  const auth = requireKey(request, "manage:keys");
  if (!auth.ok) return auth.response;
  const keys = readStore().keys.filter((row) => row.site === auth.key.site).map(publicKeyView);
  return NextResponse.json({ keys, rateCard: null, billing: null });
}

export async function POST(request: Request) {
  const blocked = limited(request, "v1-keys", 10);
  if (blocked) return blocked;
  const parsed = await readJsonBody<{ site?: string; label?: string }>(request);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  if (!parsed.value.site || !isSiteId(parsed.value.site)) {
    return NextResponse.json({ error: "unknown_site" }, { status: 400 });
  }
  const issued = mutateStore((store) => {
    const next = issueLocalKey({
      site: parsed.value.site!,
      label: parsed.value.label ?? `${parsed.value.site} local`,
    });
    store.keys.push(next.record);
    return next;
  });
  recordEvent({ name: "key_created", site: issued.record.site, properties: { keyId: issued.record.id } });
  return NextResponse.json({
    key: publicKeyView(issued.record),
    token: issued.token,
    shownOnce: true,
    rateCard: null,
    billing: null,
    message: "Local key only. The secret is shown once and is not billed.",
  });
}
