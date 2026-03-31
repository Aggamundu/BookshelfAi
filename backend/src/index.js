import './loadEnv.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { defaultRateLimiter } from './middleware/rateLimiter.js';
import booksRouter from './routes/books.js';
import usersRouter from './routes/users.js';
import pool from './db/client.js';
import { redis } from './lib/upstashRedis.js';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
const app = express();
const PORT = process.env.PORT ?? 3000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Vite client build (repo root client/dist) — same server as API in production */
const clientDist = path.resolve(__dirname, '../../client/dist');
const clientIndexHtml = path.join(clientDist, 'index.html');

if (process.env.TRUST_PROXY === '1' || process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

function corsOriginConfig() {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  const raw = process.env.CORS_ORIGIN;
  if (!raw?.trim()) {
    logger.warn('CORS_ORIGIN unset in production — set to your frontend URL(s), comma-separated');
    return false;
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: corsOriginConfig(),
    credentials: true,
  })
);
app.use(
  pinoHttp({
    logger,
    redact: ['req.headers.authorization', 'req.headers.cookie'],
  })
);

const bodyLimit = process.env.JSON_BODY_LIMIT ?? '512kb';
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

app.use('/api/users', defaultRateLimiter, usersRouter);
app.use('/api/books', booksRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health/ready', async (_req, res) => {
  const checks = { postgres: 'unknown', redis: 'unknown' };
  try {
    await pool.query('SELECT 1');
    checks.postgres = 'ok';
  } catch (e) {
    checks.postgres = `fail: ${e.message}`;
    return res.status(503).json({ status: 'not_ready', checks });
  }
  try {
    if (!redis) {
      checks.redis = 'missing';
      return res.status(503).json({ status: 'not_ready', checks });
    }
    const pong = await redis.ping();
    checks.redis = pong === 'PONG' ? 'ok' : `fail: ${pong}`;
    if (checks.redis !== 'ok') {
      return res.status(503).json({ status: 'not_ready', checks });
    }
  } catch (e) {
    checks.redis = `fail: ${e.message}`;
    return res.status(503).json({ status: 'not_ready', checks });
  }
  res.json({ status: 'ready', checks });
});

if (fs.existsSync(clientIndexHtml)) {
  app.use(express.static(clientDist));
  /** SPA fallback (Express 5 path-to-regexp rejects `*` / `/*` — use middleware + GET only) */
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(clientIndexHtml, (err) => next(err));
  });
} else if (process.env.NODE_ENV === 'production') {
  logger.warn(
    { clientDist },
    'client build not found — run `npm run build` (workspace root) before deploy; GET / will 404'
  );
}

app.use((err, req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large.' });
  }

  if (err.message?.includes?.('Unsupported file type')) {
    return res.status(400).json({ error: err.message });
  }

  const status = err.status ?? err.statusCode ?? 500;
  if (status >= 500) {
    req.log?.error(
      { err: { message: err.message, stack: err.stack }, path: req.path, method: req.method },
      'server error'
    );
  }

  const message = status >= 500 ? 'Internal server error' : err.message || 'Error';
  res.status(status).json({ error: message });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    logger.info({ port: PORT }, 'BookshelfAI listening');
  });
}

// Export for Vercel serverless (when deployed)
export default app;
