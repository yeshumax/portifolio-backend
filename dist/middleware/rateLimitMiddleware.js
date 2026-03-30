"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRateLimit = exports.generalRateLimit = exports.authRateLimit = exports.createRateLimit = exports.clearRateLimits = void 0;
const store = {};
const cleanupStore = () => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
        if (store[key].resetTime < now && !store[key].blockedUntil) {
            delete store[key];
        }
        else if (store[key].blockedUntil && store[key].blockedUntil < now) {
            delete store[key];
        }
    });
};
// Clean up every 5 minutes
setInterval(cleanupStore, 5 * 60 * 1000);
// Development helper to clear rate limits
const clearRateLimits = () => {
    Object.keys(store).forEach(key => delete store[key]);
    console.log('Rate limit store cleared');
};
exports.clearRateLimits = clearRateLimits;
const getClientKey = (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
};
const createRateLimit = (options) => {
    return (req, res, next) => {
        const key = getClientKey(req);
        const now = Date.now();
        // Initialize or get existing record
        if (!store[key] || store[key].resetTime < now) {
            store[key] = {
                count: 0,
                resetTime: now + options.windowMs
            };
        }
        // Check if client is blocked
        if (store[key].blockedUntil && store[key].blockedUntil > now) {
            const remainingTime = Math.ceil((store[key].blockedUntil - now) / 1000);
            return res.status(429).json({
                success: false,
                message: options.message || `Too many requests. Try again in ${remainingTime} seconds.`,
                retryAfter: remainingTime
            });
        }
        // Increment request count
        store[key].count++;
        // Check if limit exceeded
        if (store[key].count > options.maxRequests) {
            // Block for exponential backoff
            const blockDuration = Math.min(options.windowMs * Math.pow(2, Math.floor(store[key].count / options.maxRequests)), 24 * 60 * 60 * 1000 // Max 24 hours
            );
            store[key].blockedUntil = now + blockDuration;
            return res.status(429).json({
                success: false,
                message: options.message || 'Too many requests. Please try again later.',
                retryAfter: Math.ceil(blockDuration / 1000)
            });
        }
        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', options.maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, options.maxRequests - store[key].count));
        res.setHeader('X-RateLimit-Reset', Math.ceil(store[key].resetTime / 1000));
        next();
    };
};
exports.createRateLimit = createRateLimit;
// Specific rate limits for auth endpoints
exports.authRateLimit = (0, exports.createRateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts. Please try again later.'
});
exports.generalRateLimit = (0, exports.createRateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    message: 'Too many requests. Please try again later.'
});
exports.registerRateLimit = (0, exports.createRateLimit)({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 20, // 20 registration attempts per 5 minutes
    message: 'Too many registration attempts. Please try again later.'
});
