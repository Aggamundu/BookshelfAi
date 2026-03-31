import pino from 'pino';
import { Redis } from '@upstash/redis';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  logger.warn(
    'Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN — cache and rate limiting will fail until set.'
  );
}
/* */
/** Shared Upstash Redis client (HTTP / REST). */
export const redis =
  url && token
    ? new Redis({ url, token })
    : null;
