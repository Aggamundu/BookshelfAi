import { Router } from 'express';
import upload from '../middleware/upload.js';
import { validateImageDimensions } from '../middleware/validateImageUpload.js';
import { strictRateLimiter } from '../middleware/rateLimiter.js';
import { extractBooksFromImage, generateRecommendations } from '../services/aiService.js';
import { getCached, setCached, recommendationCacheKey } from '../services/cacheService.js';
import pool from '../db/client.js';
import { ensureAnonymousUser, isValidUuid } from '../lib/userIdentity.js';

const router = Router();

router.use(strictRateLimiter);

/**
 * POST /api/books/scan
 * Body: multipart/form-data with field "image"
 * Returns the list of books detected on the shelf.
 */
router.post('/scan', upload.single('image'), validateImageDimensions, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided. Use field name "image".' });
    }

    const books = await extractBooksFromImage(req.file.buffer, req.file.mimetype);
    res.json({ books });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/books/recommend
 * Body (JSON):
 *   { userId: string, books: [{title, author}] }
 * `books` must be titles identified from the user's shelf (client sends scan results only).
 * userId: anonymous UUID from POST /api/users/session (or client-generated then ensured).
 *
 * Fetches the user's reading history and preferences from the DB for extra context,
 * then asks the AI for personalised recommendations (new books not on that shelf list).
 * Results are cached in Redis keyed by userId + book list.
 */
router.post('/recommend', async (req, res, next) => {
  try {
    const { userId, books } = req.body;

    if (!userId || !Array.isArray(books) || books.length === 0) {
      return res
        .status(400)
        .json({ error: 'Provide userId and a non-empty books array.' });
    }

    if (!isValidUuid(userId)) {
      return res.status(400).json({
        error: 'userId must be a valid UUID (from POST /api/users/session).',
      });
    }

    await ensureAnonymousUser(userId);

    // Check cache first
    const cacheKey = recommendationCacheKey(userId, books.map((b) => b.title));
    const cached = await getCached(cacheKey);
    if (cached) {
      return res.json({ recommendations: cached, source: 'cache' });
    }

    // Fetch user context from DB
    const [historyResult, prefsResult] = await Promise.all([
      pool.query(
        `SELECT book_title, author, status, rating
           FROM reading_history
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 50`,
        [userId]
      ),
      pool.query(
        `SELECT favorite_genres, favorite_authors, notes
           FROM user_preferences
          WHERE user_id = $1`,
        [userId]
      ),
    ]);

    const history = historyResult.rows;
    const preferences = prefsResult.rows[0] ?? {
      favorite_genres: [],
      favorite_authors: [],
      notes: null,
    };

    const recommendations = await generateRecommendations(books, history, preferences);

    // Cache and return
    await setCached(cacheKey, recommendations);
    res.json({ recommendations, source: 'ai' });
  } catch (err) {
    next(err);
  }
});

export default router;
