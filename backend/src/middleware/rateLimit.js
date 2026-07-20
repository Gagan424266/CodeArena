/**
 * Sliding-window rate limiter (DSA: circular buffer of timestamps per key).
 */
export function createRateLimiter({ windowMs = 60000, max = 10 } = {}) {
  const hits = new Map(); // key -> number[]

  return function rateLimit(req, res, next) {
    const key = req.user?.sub || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    let arr = hits.get(key) || [];
    arr = arr.filter((t) => t > windowStart);
    if (arr.length >= max) {
      return res.status(429).json({
        error: 'Too many submissions. Slow down.',
        retryAfterMs: arr[0] + windowMs - now,
      });
    }
    arr.push(now);
    hits.set(key, arr);
    next();
  };
}
