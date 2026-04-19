const rateLimit = require('express-rate-limit');

// Disable rate limiting in development
const isDevelopment = process.env.NODE_ENV === 'development';

// More permissive global limit - 200 requests per 15 minutes
// Disabled in development (unlimited requests)
const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000000 : 200, // Unlimited in development, 200 in production
  message: { success: false, error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: isDevelopment ? () => false : undefined, // Always apply but with very high limit in dev
});

module.exports = { globalRateLimit };