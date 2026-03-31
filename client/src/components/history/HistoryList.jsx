import HistoryBookCard from './HistoryBookCard.jsx'

/** Map API status to an extra chip (omit generic “read”). */
function statusLabel(status) {
  if (!status || status === 'read') return null
  const map = {
    reading: 'Reading',
    want_to_read: 'Want to read',
  }
  return map[status] ?? status
}

/**
 * @param {{ entries: Array<{
 *   id: string
 *   book_title: string
 *   author?: string | null
 *   rating?: number | null
 *   status?: string
 *   coverUrl?: string | null
 *   tags?: string[]
 *   quote?: string | null
 * }> }} props
 */
export default function HistoryList({ entries }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low/50 px-6 py-12 text-center">
        <p className="font-body text-on-surface-variant">
          No books yet. Use <strong className="text-on-surface">Add Manually</strong> to log what
          you&apos;ve read.
        </p>
      </div>
    )
  }

  return (
    <section className="space-y-8">
      {entries.map((row) => {
        const tagFromStatus = statusLabel(row.status)
        const tags = [...(row.tags ?? []), ...(tagFromStatus ? [tagFromStatus] : [])]

        return (
          <HistoryBookCard
            key={row.id}
            title={row.book_title}
            author={row.author}
            rating={row.rating}
            tags={tags}
            quote={row.quote}
            coverUrl={row.coverUrl}
          />
        )
      })}
    </section>
  )
}
