import { NextResponse } from "next/server";
import { classifyIntent, isMonetizationEvent, type MonetizationEventName, type SiteId } from "@penta/monetization";
import {
  apiError,
  consumeQuota,
  MemoryRateLimiter,
  newRequestId,
  periodStart,
  rateLimitHeaders,
  requireProductKey,
  type ApiErrorCode,
  type KeyScope,
} from "@penta/platform-api";
import { clientKey } from "@/lib/rate-limit";
import { newId, repo } from "@/lib/platform-store";

const limiter = new MemoryRateLimiter();

export function requestIdOf(request: Request): string {
  return request.headers.get("x-request-id") || newRequestId();
}

export function fail(code: ApiErrorCode, message: string, requestId: string, details?: Record<string, unknown>) {
  const { status, body } = apiError(code, message, requestId, details);
  const headers: Record<string, string> = { "X-Request-Id": requestId };
  if (code === "rate_limited" || code === "quota_exceeded") headers["Retry-After"] = "60";
  return NextResponse.json(body, { status, headers });
}

export function limited(request: Request, bucket: string, limit = 40) {
  const hit = limiter.hit(`${bucket}:${clientKey(request)}`, limit, 60_000);
  if (!hit.ok) {
    const id = requestIdOf(request);
    const res = fail("rate_limited", "Too many requests.", id);
    for (const [key, value] of Object.entries(rateLimitHeaders(hit))) res.headers.set(key, value);
    return res;
  }
  return null;
}

export async function requireEngine(request: Request, site: SiteId, scope: KeyScope = "engine:read") {
  const id = requestIdOf(request);
  const store = repo();
  await store.bootstrapLocalDev();
  const keys = await store.listKeys();
  const auth = requireProductKey(keys, request, site, scope);
  if (!auth.ok) {
    return {
      ok: false as const,
      response: fail(auth.error, auth.message, id, { site }),
    };
  }
  const entitlement = await store.entitlement(auth.key.organizationId, site, "api_calls");
  const start = periodStart(entitlement?.period ?? "month");
  const current = await store.usage(auth.key.organizationId, site, "api_calls", start);
  const quota = consumeQuota({ entitlement, used: current.used });
  if (!quota.ok) {
    return {
      ok: false as const,
      response: fail("quota_exceeded", "Monthly API entitlement exhausted.", id, {
        site,
        limit: quota.limit,
        used: quota.used,
      }),
    };
  }
  await store.incrementUsage(auth.key.organizationId, site, "api_calls", start, 1);
  await store.touchKey(auth.key.id);
  return { ok: true as const, key: auth.key, requestId: id, remaining: quota.remaining, limit: quota.limit };
}

export async function recordEvent(input: {
  name: MonetizationEventName;
  site: SiteId | "platform";
  path?: string;
  entityId?: string;
  properties?: Record<string, unknown>;
}) {
  if (!isMonetizationEvent(input.name)) throw new Error("unknown_event");
  const intent = input.path ? classifyIntent({ path: input.path }).kind : undefined;
  await repo().addEvent({
    id: newId("evt"),
    name: input.name,
    site: input.site,
    path: input.path,
    entityId: input.entityId,
    properties: { ...input.properties, intent },
    at: new Date().toISOString(),
  });
}

export async function logRequest(input: {
  request: Request;
  site: SiteId | "platform";
  status: number;
  started: number;
  keyId?: string;
  organizationId?: string;
  errorCode?: string;
  entityId?: string;
}) {
  await repo().addRequestLog({
    requestId: requestIdOf(input.request),
    timestamp: new Date().toISOString(),
    organizationId: input.organizationId,
    keyId: input.keyId,
    site: input.site,
    route: new URL(input.request.url).pathname,
    status: input.status,
    latencyMs: Date.now() - input.started,
    errorCode: input.errorCode,
    entityId: input.entityId,
  });
}

export function ok(request: Request, payload: unknown, extraHeaders?: Record<string, string>) {
  const headers = { "X-Request-Id": requestIdOf(request), ...extraHeaders };
  return NextResponse.json(payload, { headers });
}
