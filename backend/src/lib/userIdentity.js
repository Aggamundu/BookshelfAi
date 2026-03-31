import { randomUUID } from 'crypto';
import pool from '../db/client.js';

/** RFC 4122 UUID (versions 1–8 in the version nibble). */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value);
}

/**
 * Ensures a row exists in `users` for this id (anonymous client-generated UUID).
 * Call before writes or when a client may skip POST /session.
 */
export async function ensureAnonymousUser(userId) {
  if (!isValidUuid(userId)) {
    const err = new Error('userId must be a valid UUID.');
    err.status = 400;
    throw err;
  }
  await pool.query(
    `INSERT INTO users (id) VALUES ($1::uuid)
     ON CONFLICT (id) DO UPDATE SET id = users.id`,
    [userId]
  );
}

export function newAnonymousUserId() {
  return randomUUID();
}

/** Express middleware: rejects invalid UUID in `req.params.id`. */
export function validateUserIdParam(req, res, next) {
  if (!isValidUuid(req.params.id)) {
    return res.status(400).json({
      error: 'Invalid user id. Use the UUID from POST /api/users/session.',
    });
  }
  next();
}
