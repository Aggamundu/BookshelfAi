import { apiFetch } from './api.js';
import { getStoredUserId, setStoredUserId } from './identity.js';

/**
 * Ensures an anonymous user row exists: calls POST /api/users/session.
 * Persists returned `userId` to localStorage (or reuses stored id).
 */
export async function ensureSession() {
  const existing = getStoredUserId();
  const data = await apiFetch('/api/users/session', {
    method: 'POST',
    body: existing ? { userId: existing } : {},
  });
  if (data?.userId) {
    setStoredUserId(data.userId);
  }
  return data;
}
