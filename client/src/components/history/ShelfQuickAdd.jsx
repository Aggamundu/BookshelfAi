import { useState } from 'react'

function isTitleInHistory(title, entries) {
  const t = title.trim().toLowerCase()
  return entries.some((e) => (e.book_title || '').trim().toLowerCase() === t)
}

/**
 * One-click add from scanned shelf titles (session storage).
 * @param {{
 *   shelfBooks: Array<{ title: string, author: string | null }>
 *   entries: Array<{ book_title: string, author?: string | null }>
 *   onAdd: (book: { title: string, author: string | null }) => Promise<void>
 *   disabled?: boolean
 * }} props
 */
export default function ShelfQuickAdd({ shelfBooks, entries, onAdd, disabled }) {
  const [addingKey, setAddingKey] = useState(null)

  if (!shelfBooks.length) return null

  const pending = shelfBooks.filter((b) => !isTitleInHistory(b.title, entries))
  if (!pending.length) return null

  return (
    <section className="mb-10 rounded-xl border border-outline-variant/25 bg-surface-container-low/60 px-4 py-5">
      <h3 className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
        Quick add from your shelf photo
      </h3>
      <p className="mt-1 font-body text-sm text-on-surface-variant">
        Tap a book to add it to your history — title and author are filled in automatically.
      </p>
      <ul className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {pending.map((b) => {
          const k = `${b.title}|${b.author ?? ''}`
          const busy = addingKey === k
          return (
            <li key={k}>
              <button
                type="button"
                disabled={disabled || busy}
                onClick={async () => {
                  setAddingKey(k)
                  try {
                    await onAdd(b)
                  } finally {
                    setAddingKey(null)
                  }
                }}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-outline-variant/30 bg-surface px-3 py-2.5 text-left font-body text-sm text-on-surface transition-colors hover:border-primary/40 hover:bg-surface-container-low disabled:opacity-50 sm:inline-flex sm:w-auto sm:max-w-full"
              >
                <span className="min-w-0">
                  <span className="font-medium">{b.title}</span>
                  {b.author ? (
                    <span className="text-on-surface-variant"> — {b.author}</span>
                  ) : null}
                </span>
                <span className="material-symbols-outlined shrink-0 text-[20px] text-primary" aria-hidden>
                  {busy ? 'hourglass_empty' : 'add_circle'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
