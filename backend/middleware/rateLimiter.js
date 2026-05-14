// Simple in-memory rate limiter — ESM version
const requestCounts = new Map();

export function getRateLimiter(maxRequests = 30, windowMs = 60 * 1000) {
  return (req, res, next) => {
    const key = req.user?.id || req.ip;
    const now = Date.now();
    const entry = requestCounts.get(key);

    if (!entry || now - entry.windowStart > windowMs) {
      requestCounts.set(key, { count: 1, windowStart: now });
      return next();
    }

    entry.count += 1;
    if (entry.count > maxRequests) {
      return res.status(429).json({
        error: 'Too many AI requests. Please wait a moment before trying again.',
        retryAfter: Math.ceil((entry.windowStart + windowMs - now) / 1000),
      });
    }
    next();
  };
}
