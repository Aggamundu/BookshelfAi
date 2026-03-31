import { Router } from 'express';
import pool from '../db/client.js';
import { deleteCached } from '../services/cacheService.js';
import {
  ensureAnonymousUser,
  newAnonymousUserId,
  isValidUuid,
  validateUserIdParam,
} from '../lib/userIdentity.js';

const router = Router();

// ── Anonymous session (no sign-up) ───────────────────────────────────────────

/**
 * POST /api/users/session
 * Body (optional): { userId?: string }
 * - Omit userId → server creates a new anonymous user and returns its UUID.
 * - Send an existing client-generated UUID → ensures that row exists (idempotent).
 * Store userId in localStorage and send as x-user-id on later requests.
 */
router.post('/session', async (req, res, next) => {
  try {
    let id = req.body?.userId;
    if (id != null && String(id).trim() !== '') {
      if (!isValidUuid(id)) {
        return res.status(400).json({ error: 'userId must be a valid UUID.' });
      }
    } else {
      id = newAnonymousUserId();
    }

    const { rows } = await pool.query(
      `INSERT INTO users (id) VALUES ($1::uuid)
       ON CONFLICT (id) DO UPDATE SET id = users.id
       RETURNING id, created_at`,
      [id]
    );

    res.status(200).json({ userId: rows[0].id, createdAt: rows[0].created_at });
  } catch (err) {
    next(err);
  }
});

// ── Reading History ──────────────────────────────────────────────────────────

/**
 * GET /api/users/:id/history
 */
router.get('/:id/history', validateUserIdParam, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, book_title, author, status, rating, created_at
         FROM reading_history
        WHERE user_id = $1
        ORDER BY created_at DESC`,
      [req.params.id]
    );
    res.json({ history: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/users/:id/history
 * Body: { book_title, author?, status?, rating? }
 */
router.post('/:id/history', validateUserIdParam, async (req, res, next) => {
  try {
    await ensureAnonymousUser(req.params.id);

    const { book_title, author = null, status = 'read', rating = null } = req.body;

    if (!book_title) {
      return res.status(400).json({ error: 'book_title is required.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO reading_history (user_id, book_title, author, status, rating)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.params.id, book_title, author, status, rating]
    );

    await bustUserRecommendationCache(req.params.id);

    res.status(201).json({ entry: rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/users/:id/history/:entryId
 */
router.delete('/:id/history/:entryId', validateUserIdParam, async (req, res, next) => {
  try {
    await pool.query(
      `DELETE FROM reading_history WHERE id = $1 AND user_id = $2`,
      [req.params.entryId, req.params.id]
    );
    await bustUserRecommendationCache(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ── User Preferences ─────────────────────────────────────────────────────────

/**
 * GET /api/users/:id/preferences
 */
router.get('/:id/preferences', validateUserIdParam, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT favorite_genres, favorite_authors, notes, updated_at
         FROM user_preferences
        WHERE user_id = $1`,
      [req.params.id]
    );
    res.json({
      preferences: rows[0] ?? { favorite_genres: [], favorite_authors: [], notes: null },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/users/:id/preferences
 * Body: { favorite_genres?, favorite_authors?, notes? }
 */
router.put('/:id/preferences', validateUserIdParam, async (req, res, next) => {
  try {
    await ensureAnonymousUser(req.params.id);

    const { favorite_genres = [], favorite_authors = [], notes = null } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO user_preferences (user_id, favorite_genres, favorite_authors, notes, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET favorite_genres  = EXCLUDED.favorite_genres,
             favorite_authors = EXCLUDED.favorite_authors,
             notes            = EXCLUDED.notes,
             updated_at       = NOW()
       RETURNING *`,
      [req.params.id, favorite_genres, favorite_authors, notes]
    );

    await bustUserRecommendationCache(req.params.id);
    res.json({ preferences: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ── Helpers ──────────────────────────────────────────────────────────────────

async function bustUserRecommendationCache(userId) {
  await deleteCached(`recs:${userId}:latest`);
}

export default router;
