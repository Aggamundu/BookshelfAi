import { apiFetch } from './api.js'

/**
 * Normalizes shelf scan / API book rows to `{ title, author }`.
 * @param {unknown} books
 * @returns {Array<{ title: string, author: string | null }>}
 */
export function normalizeShelfBooks(books) {
  if (!Array.isArray(books)) return []
  return books
    .filter((b) => b && typeof b.title === 'string' && b.title.trim())
    .map((b) => ({
      title: b.title.trim(),
      author: typeof b.author === 'string' && b.author.trim() ? b.author.trim() : null,
    }))
}

/**
 * POST /api/books/scan — vision extraction (rate-limited on server).
 * @param {File} file
 * @returns {Promise<Array<{ title: string, author: string | null }>>}
 */
export async function scanShelfImage(file) {
  const fd = new FormData()
  fd.append('image', file)
  const data = await apiFetch('/api/books/scan', {
    method: 'POST',
    body: fd,
  })
  return normalizeShelfBooks(data?.books)
}
