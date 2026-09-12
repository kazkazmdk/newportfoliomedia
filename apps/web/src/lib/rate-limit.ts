const buckets = new Map<string, { n: number; reset: number }>();

export function rateLimit(key: string, limit = 40, windowMs = 60_000): { ok: boolean; remaining: number } {
  const now = Date.now();
  const row = buckets.get(key);
  if (!row || row.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (row.n >= limit) return { ok: false, remaining: 0 };
  row.n += 1;
  return { ok: true, remaining: limit - row.n };
}

export function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}
