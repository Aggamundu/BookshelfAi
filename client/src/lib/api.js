import { getStoredUserId } from './identity.js';

/**
 * Base URL for the Express API (no trailing slash).
 * Set `VITE_API_URL` in `.env` (e.g. http://localhost:3000 or your deployed API).
 */
export function getApiBase() {
  const raw = import.meta.env.VITE_API_URL ?? '';
  if (!raw.trim() && import.meta.env.DEV) {
    console.warn(
      '[BookshelfAi] VITE_API_URL is unset — using http://localhost:3000. Add VITE_API_URL to client/.env'
    );
  }
  const base = (raw.trim() || 'http://localhost:3000').replace(/\/$/, '');

  if (import.meta.env.PROD) {
    const looksLikeLocalApi =
      !raw.trim() ||
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(raw.trim());
    if (looksLikeLocalApi) {
      console.error(
        '[BookshelfAi] Production build has no public API URL (or VITE_API_URL points at localhost). ' +
          'On your phone, "localhost" is the phone itself — not your computer — so session and scans will fail. ' +
          'Set VITE_API_URL in Vercel to your deployed API (https://…) and redeploy.'
      );
    }
  }

  if (typeof window !== 'undefined') {
    const pageHttps = window.location.protocol === 'https:';
    const apiHttp = base.startsWith('http://');
    const apiLocal = /localhost|127\.0\.0\.1/.test(base);
    if (pageHttps && apiHttp && !apiLocal) {
      console.warn(
        '[BookshelfAi] Page is HTTPS but VITE_API_URL is HTTP — browsers (especially mobile Safari) block this (mixed content). Set VITE_API_URL to https://… for your API.'
      );
    }
  }
  return base;
}

/**
 * `fetch` wrapper: prefixes `VITE_API_URL`, attaches `x-user-id` when present.
 * JSON-serializes plain object bodies. Leaves `FormData` / `Blob` unchanged.
 */
export async function apiFetch(path, options = {}) {
  const base = getApiBase();
  const pathPart = path.startsWith('/') ? path : `/${path}`;
  const url = path.startsWith('http') ? path : `${base}${pathPart}`;

  const headers = new Headers(options.headers ?? undefined);
  const userId = getStoredUserId();
  if (userId) {
    headers.set('x-user-id', userId);
  }

  let body = options.body;
  if (
    body != null &&
    typeof body === 'object' &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer) &&
    !(body instanceof URLSearchParams)
  ) {
    body = JSON.stringify(body);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  const res = await fetch(url, { ...options, headers, body });

  if (!res.ok) {
    const text = await res.text();
    let payload;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { error: text || res.statusText };
    }
    const err = new Error(payload.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = payload;
    throw err;
  }

  if (res.status === 204) {
    return null;
  }

  const ct = res.headers.get('content-type');
  if (ct?.includes('application/json')) {
    return res.json();
  }
  return res.text();
}
