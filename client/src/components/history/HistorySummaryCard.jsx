/**
 * Compact glance at books already added to reading history (matches ShelfQuickAdd layout).
 * @param {{ entries: Array<{ id: string, book_title: string, author?: string | null }> }} props
 */
export default function HistorySummaryCard({ entries }) {
  if (!entries.length) return null

  return (
    <section className="mb-10 rounded-xl border border-outline-variant/25 bg-surface-container-low/60 px-4 py-5">
      <h3 className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
        In your reading history
      </h3>
      <p className="mt-1 font-body text-sm text-on-surface-variant">
        You&apos;ve added {entries.length} {entries.length === 1 ? 'book' : 'books'} to your history on this step.
      </p>
      <ul className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {entries.map((e) => (
          <li key={e.id}>
            <div className="flex w-full items-center justify-between gap-3 rounded-lg border border-outline-variant/30 bg-surface px-3 py-2.5 text-left font-body text-sm text-on-surface sm:inline-flex sm:w-auto sm:max-w-full">
              <span className="min-w-0">
                <span className="font-medium">{e.book_title}</span>
                {e.author ? (
                  <span className="text-on-surface-variant"> — {e.author}</span>
                ) : null}
              </span>
              <span className="material-symbols-outlined shrink-0 text-[20px] text-primary" aria-hidden>
                menu_book
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
