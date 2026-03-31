import { redis } from '../lib/upstashRedis.js';

const TTL = Number(process.env.CACHE_TTL_SECONDS ?? 3600);

export async function getCached(key) {
  if (!redis) return null;
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error('Cache GET error:', err);
    return null;
  }
}

export async function setCached(key, value, ttl = TTL) {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttl });
  } catch (err) {
    console.error('Cache SET error:', err);
  }
}

export async function deleteCached(key) {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (err) {
    console.error('Cache DEL error:', err);
  }
}

// Build a deterministic cache key for a recommendation request
export function recommendationCacheKey(userId, bookTitles) {
  const sorted = [...bookTitles].sort().join('|');
  return `recs:${userId}:${Buffer.from(sorted).toString('base64url').slice(0, 40)}`;
}
