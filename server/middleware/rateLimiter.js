// Simple in-memory rate limiter — brute force attacks rokta hai
const attempts = new Map();

const rateLimiter = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const key  = req.ip + req.path;
    const now  = Date.now();
    const data = attempts.get(key) || { count: 0, resetAt: now + windowMs };

    // Reset window if expired
    if (now > data.resetAt) {
      data.count   = 0;
      data.resetAt = now + windowMs;
    }

    data.count++;
    attempts.set(key, data);

    if (data.count > maxAttempts) {
      const retryAfter = Math.ceil((data.resetAt - now) / 1000);
      return res.status(429).json({
        message: `Too many attempts. Try again in ${retryAfter} seconds.`,
        retryAfter,
      });
    }

    next();
  };
};

module.exports = rateLimiter;
