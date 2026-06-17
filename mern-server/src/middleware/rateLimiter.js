const rateLimit = require('express-rate-limit');

// Auth routes (register/login) -> strict limit (5 requests per 1 minute allowed, 6th blocked)
exports.authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'test' ? 100 : 5,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Global API routes -> moderate limit (100 requests per 15 minutes allowed, 101st blocked)
exports.globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});
