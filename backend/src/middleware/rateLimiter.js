const rateLimit = require('express-rate-limit');

// More permissive global limit - 200 requests per 15 minutes
const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // increased from 100
  message: { success: false, error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { globalRateLimit };