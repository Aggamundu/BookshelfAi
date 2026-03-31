/**
 * Loads .env from project root and checks Supabase (pg), Upstash Redis, and OpenAI.
 * Uses the same DB pool as the app (backend/src/db/client.js).
 * Run: npm run verify   (or: node scripts/verify-env.mjs)
 */
import 'dotenv/config';
import pool from '../backend/src/db/client.js';
import { Redis } from '@upstash/redis';
import OpenAI from 'openai';

async function checkPostgres() {
  const { rows } = await pool.query('SELECT 1 AS ok');
  return rows[0]?.ok === 1 ? 'ok' : 'unexpected response';
}

async function checkRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN missing');
  const redis = new Redis({ url, token });
  const pong = await redis.ping();
  return pong === 'PONG' ? 'ok' : `unexpected: ${pong}`;
}

/** Tiny chat ping; default gpt-4o-mini to minimize verify cost. */
const VERIFY_MODEL = process.env.OPENAI_VERIFY_MODEL ?? 'gpt-4o-mini';

async function checkOpenAI() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  await client.chat.completions.create({
    model: VERIFY_MODEL,
    max_tokens: 16,
    messages: [{ role: 'user', content: 'Reply with exactly: ok' }],
  });
  return 'ok';
}

async function main() {
  const checks = {};

  try {
    checks.postgres = await checkPostgres();
  } catch (e) {
    checks.postgres = `fail: ${e.message}`;
  }

  try {
    checks.redis = await checkRedis();
  } catch (e) {
    checks.redis = `fail: ${e.message}`;
  }

  try {
    checks.openai = await checkOpenAI();
  } catch (e) {
    checks.openai = `fail: ${e.message}`;
  }

  console.log(JSON.stringify({ checks }, null, 2));
  const allOk = Object.values(checks).every((v) => v === 'ok');
  await pool.end();
  process.exit(allOk ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  pool.end().finally(() => process.exit(1));
});
