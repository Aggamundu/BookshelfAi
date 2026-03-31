import pg from 'pg';

const { Pool } = pg;

/**
 * Supabase and other hosted Postgres require TLS. Local dev on localhost typically does not.
 * Set DATABASE_SSL=false to force SSL off (rare).
 */
function getSsl() {
  if (process.env.DATABASE_SSL === 'false') return false;
  const url = process.env.DATABASE_URL ?? '';
  if (/localhost|127\.0\.0\.1/.test(url)) return false;
  return { rejectUnauthorized: false };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getSsl(),
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export default pool;
