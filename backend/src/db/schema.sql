-- Run this in your Supabase SQL editor to bootstrap the schema.
-- Anonymous users: the client generates a UUID (or receives one from POST /api/users/session)
-- and sends it as x-user-id / in URLs. No email or password.

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_title  TEXT NOT NULL,
  author      TEXT,
  status      TEXT CHECK (status IN ('read', 'reading', 'want_to_read')) DEFAULT 'read',
  rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  favorite_genres  TEXT[] DEFAULT '{}',
  favorite_authors TEXT[] DEFAULT '{}',
  notes            TEXT,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);

-- ── Migrating from the older email-required schema (run once if applicable) ──
-- ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
-- Optional: remove email column entirely:
-- ALTER TABLE users DROP COLUMN IF EXISTS email;
