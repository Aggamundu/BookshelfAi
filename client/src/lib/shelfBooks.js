/**
 * Parsed shelf scan for POST /api/books/recommend (`books` array).
 * Set after POST /api/books/scan succeeds (see HomePage).
 */
export function getShelfBooksFromStorage() {
  try {
    const raw = sessionStorage.getItem('bookshelfai_shelfBooks')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    return parsed
      .filter((b) => b && typeof b.title === 'string')
      .map((b) => ({ title: b.title, author: b.author ?? null }))
  } catch {
    return null
  }
}
