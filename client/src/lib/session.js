import { apiFetch } from './api.js';
import { getStoredUserId, setStoredUserId } from './identity.js';

/** Browser/network quirks: Safari often says "Load failed" instead of Chrome's "Failed to fetch". */
function isTransientNetworkError(err) {
  const msg = (err.message || '').toLowerCase();
  if (/failed to fetch|load failed|network error|the network connection was lost/i.test(msg)) {
    return true;
  }
  const s = err.status;
  return s === 502 || s === 503 || s === 504;
}

/**
 * Ensures an anonymous user row exists: calls POST /api/users/session.
 * Persists returned `userId` to localStorage (or reuses stored id).
 * Retries a few times on transient failures (common when the API boots slower than the Vite dev client).
 */
export async function ensureSession() {
  const existing = getStoredUserId();
  const body = existing ? { userId: existing } : {};
  let lastErr;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const data = await apiFetch('/api/users/session', {
        method: 'POST',
        body,
      });
      if (data?.userId) {
        setStoredUserId(data.userId);
      }
      return data;
    } catch (e) {
      lastErr = e;
      if (!isTransientNetworkError(e) || attempt === 4) {
        throw e;
      }
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  throw lastErr;
}
