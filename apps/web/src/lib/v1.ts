import { NextResponse } from "next/server";
import { classifyIntent, isMonetizationEvent, type MonetizationEventName, type SiteId } from "@penta/monetization";
import { authorize, bumpMeter, type KeyScope } from "@penta/platform-api";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { mutateStore, newId, readStore } from "@/lib/platform-store";

export function limited(request: Request, bucket: string, limit = 40) {
  const result = rateLimit(`${bucket}:${clientKey(request)}`, limit);
  if (!result.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  return null;
}

export function requireKey(request: Request, scope: KeyScope) {
  const auth = authorize(readStore().keys, request, scope);
  if (!auth.ok) return { ok: false as const, response: NextResponse.json({ error: auth.error }, { status: auth.status }) };
  const metered = mutateStore((store) => {
    const path = new URL(request.url).pathname;
    const result = bumpMeter(store.meter, { keyId: auth.key.id, site: auth.key.site, path });
    store.meter = result.buckets;
    if (result.exceeded) {
      store.events.push({
        id: newId("evt"),
        name: "meter_exceeded",
        site: auth.key.site,
        path,
        properties: { keyId: auth.key.id, calls: result.current.calls },
        at: new Date().toISOString(),
      });
    }
    return result;
  });
  return { ok: true as const, key: auth.key, meter: metered.current, exceeded: metered.exceeded };
}

export function recordEvent(input: {
  name: MonetizationEventName;
  site: SiteId | "platform";
  path?: string;
  entityId?: string;
  properties?: Record<string, unknown>;
}) {
  if (!isMonetizationEvent(input.name)) throw new Error("unknown_event");
  const intent = input.path ? classifyIntent({ path: input.path }).kind : undefined;
  return mutateStore((store) => {
    const event = {
      id: newId("evt"),
      name: input.name,
      site: input.site,
      intent,
      entityId: input.entityId,
      path: input.path,
      properties: input.properties ?? {},
      at: new Date().toISOString(),
    };
    store.events.push(event);
    return event;
  });
}
