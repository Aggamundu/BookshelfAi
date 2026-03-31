import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.warn(
    'Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN — cache and rate limiting will fail until set.'
  );
}

/** Shared Upstash Redis client (HTTP / REST). */
export const redis =
  url && token
    ? new Redis({ url, token })
    : null;
