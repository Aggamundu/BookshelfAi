import { useState } from 'react'

/**
 * @param {{
 *   open: boolean
 *   onClose: () => void
 *   onSubmit: (payload: { book_title: string, author: string | null }) => Promise<void>
 * }} props
 */
export default function AddBookManualModal({ open, onClose, onSubmit }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [saving, setSaving] = useState(false)

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSubmit({
        book_title: title.trim(),
        author: author.trim() || null,
      })
      setTitle('')
      setAuthor('')
      onClose()
    } catch {
      /* parent alerts */
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-inverse-surface/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-book-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="add-book-title" className="font-headline text-2xl text-primary">
          Add a book
        </h3>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="book-title" className="font-label text-sm text-on-surface-variant">
              Title
            </label>
            <input
              id="book-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 font-body text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="The Alchemist"
            />
          </div>
          <div>
            <label htmlFor="book-author" className="font-label text-sm text-on-surface-variant">
              Author
            </label>
            <input
              id="book-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 font-body text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Paulo Coelho"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 font-body text-sm text-on-surface-variant hover:bg-surface-container"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 font-body text-sm font-medium text-on-primary hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
