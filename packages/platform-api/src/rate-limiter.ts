export type RateLimitHit = {
  ok: boolean;
  limit: number;
  remaining: number;
  retryAfter: number;
};

export interface RateLimiter {
  hit(key: string, limit: number, windowMs: number): RateLimitHit;
}

export class MemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, { n: number; reset: number }>();

  hit(key: string, limit: number, windowMs: number): RateLimitHit {
    const now = Date.now();
    const row = this.buckets.get(key);
    if (!row || row.reset < now) {
      this.buckets.set(key, { n: 1, reset: now + windowMs });
      return { ok: true, limit, remaining: limit - 1, retryAfter: 0 };
    }
    if (row.n >= limit) {
      return { ok: false, limit, remaining: 0, retryAfter: Math.max(1, Math.ceil((row.reset - now) / 1000)) };
    }
    row.n += 1;
    return { ok: true, limit, remaining: limit - row.n, retryAfter: 0 };
  }
}

/** Hosted adapter is plugged in when a durable store exists. Not a vendor SDK. */
export type DurableCounter = {
  incr(key: string, windowMs: number): Promise<{ n: number; reset: number }>;
};

export class DurableRateLimiter implements RateLimiter {
  constructor(private readonly store: DurableCounter) {}

  hit(key: string, limit: number, windowMs: number): RateLimitHit {
    throw new Error("DurableRateLimiter.hit is async-only; use hitAsync.");
  }

  async hitAsync(key: string, limit: number, windowMs: number): Promise<RateLimitHit> {
    const row = await this.store.incr(key, windowMs);
    const remaining = Math.max(0, limit - row.n);
    return {
      ok: row.n <= limit,
      limit,
      remaining,
      retryAfter: row.n <= limit ? 0 : Math.max(1, Math.ceil((row.reset - Date.now()) / 1000)),
    };
  }
}

export function rateLimitHeaders(hit: RateLimitHit): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(hit.limit),
    "X-RateLimit-Remaining": String(hit.remaining),
  };
  if (!hit.ok) headers["Retry-After"] = String(hit.retryAfter);
  return headers;
}
