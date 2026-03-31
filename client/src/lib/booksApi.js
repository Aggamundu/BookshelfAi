import { apiFetch } from './api.js'

/**
 * HEIC/HEIF in the browser → JPEG before upload.
 * Deployed Linux APIs often lack HEIF in `sharp`; macOS dev works without this.
 */
async function heifFileToJpeg(file) {
  const type = (file.type || '').toLowerCase()
  const name = (file.name || '').toLowerCase()
  const isHeif =
    type === 'image/heic' ||
    type === 'image/heif' ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  if (!isHeif) {
    return file
  }

  try {
    const { default: heic2any } = await import('heic2any')
    const result = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.92,
    })
    const blob = Array.isArray(result) ? result[0] : result
    const base = (file.name || 'shelf').replace(/\.(heic|heif)$/i, '') || 'shelf'
    return new File([blob], `${base}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })
  } catch (e) {
    console.error('[BookshelfAi] HEIC conversion failed:', e)
    throw new Error(
      'Could not convert this HEIC photo in the browser. Export as JPEG from Preview or Photos, then upload again.'
    )
  }
}

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
  const image = await heifFileToJpeg(file)
  const fd = new FormData()
  fd.append('image', image)
  const data = await apiFetch('/api/books/scan', {
    method: 'POST',
    body: fd,
  })
  return normalizeShelfBooks(data?.books)
}
