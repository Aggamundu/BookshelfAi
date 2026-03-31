import pino from 'pino';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '../lib/upstashRedis.js';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
let warnedNoRedis = false;

/**
 * @param {{ prefix: string, maxRequests: number, windowSeconds: number }} opts
 */
function createRateLimiter({ prefix, maxRequests, windowSeconds }) {
  let ratelimit = null;

  function getRatelimit() {
    if (!redis) return null;
    if (!ratelimit) {
      ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
        prefix,
      });
    }
    return ratelimit;
  }

  return async function rateLimiter(req, res, next) {
    const rl = getRatelimit();
    if (!rl) {
      if (!warnedNoRedis) {
        warnedNoRedis = true;
        logger.warn('Rate limiting disabled: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
      }
      return next();
    }

    const key = req.headers['x-user-id'] ?? req.ip;
    try {
      const result = await rl.limit(key);
      if (result.pending) {
        await result.pending.catch(() => {});
      }

      if (!result.success) {
        const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
        res.set('Retry-After', String(retryAfter));
        return res.status(429).json({
          error: 'Too many requests.',
          retryAfterSeconds: retryAfter,
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

/** Default limits for read-heavy routes (e.g. /api/users). */
export const defaultRateLimiter = createRateLimiter({
  prefix: 'bookshelfai',
  maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 60),
  windowSeconds: Number(process.env.RATE_LIMIT_WINDOW_SECONDS ?? 60),
});

/** Stricter limits for expensive AI routes (/api/books). */
export const strictRateLimiter = createRateLimiter({
  prefix: 'bookshelfai-ai',
  maxRequests: Number(process.env.RATE_LIMIT_AI_MAX_REQUESTS ?? 10),
  windowSeconds: Number(process.env.RATE_LIMIT_AI_WINDOW_SECONDS ?? 60),
});
