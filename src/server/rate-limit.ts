type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();

// In-memory sliding-window-ish (fixed window) limiter. Correct for a single
// Node process — this app runs one server against one Postgres instance, so
// there's no multi-instance state to share yet. If this ever moves behind
// multiple server instances or edge functions, swap the Map for Redis
// (e.g. Upstash) — the checkRateLimit call site doesn't need to change.
export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  const resetAt = existing.windowStart + windowMs;
  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt };
}

// Periodic sweep so the map doesn't grow unbounded across long-lived
// dev/server processes once many distinct users have hit the endpoint.
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > SWEEP_INTERVAL_MS) buckets.delete(key);
  }
}, SWEEP_INTERVAL_MS).unref();
