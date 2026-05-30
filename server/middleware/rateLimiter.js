const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

// Stricter limiter for URL creation
const createUrlLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many URL creation requests. Limit: 20 per minute.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

module.exports = { apiLimiter, createUrlLimiter };
