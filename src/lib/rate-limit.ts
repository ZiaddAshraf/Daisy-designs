type RateLimitRecord = {
  tokens: number;
  lastRefill: number;
};

const store = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  intervalMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests allowed per window
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

/**
 * Extracts client IP safely from request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp && /^[0-9a-fA-F:.]+$/.test(firstIp)) {
      return firstIp;
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp && /^[0-9a-fA-F:.]+$/.test(realIp)) {
    return realIp.trim();
  }

  return "127.0.0.1";
}

/**
 * In-memory sliding token rate limiter.
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { intervalMs: 60 * 1000, maxRequests: 60 }
): RateLimitResult {
  const now = Date.now();
  let record = store.get(identifier);

  if (!record) {
    record = { tokens: options.maxRequests, lastRefill: now };
    store.set(identifier, record);
  }

  // Refill tokens based on elapsed time
  const elapsed = now - record.lastRefill;
  if (elapsed >= options.intervalMs) {
    record.tokens = options.maxRequests;
    record.lastRefill = now;
  }

  if (record.tokens > 0) {
    record.tokens -= 1;
    return {
      success: true,
      limit: options.maxRequests,
      remaining: record.tokens,
      resetMs: Math.max(0, options.intervalMs - elapsed),
    };
  }

  return {
    success: false,
    limit: options.maxRequests,
    remaining: 0,
    resetMs: Math.max(0, options.intervalMs - elapsed),
  };
}

export function resetRateLimitsForTesting(): void {
  store.clear();
}

