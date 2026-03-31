/**
 * @param {{ books: Array<{ title: string, author: string | null }> }} props
 */
export default function IdentifiedBooksList({ books }) {
  if (books.length === 0) return null

  return (
    <div className="mx-auto w-full max-w-lg rounded-xl border border-outline-variant/30 bg-surface-container-low/80 px-4 py-5">
      <h3 className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
        Identified from your photo
      </h3>
      <ul className="mt-3 space-y-2">
        {books.map((b, i) => (
          <li key={`${b.title}-${i}`} className="font-body text-sm text-on-surface">
            <span className="font-medium">{b.title}</span>
            {b.author ? <span className="text-on-surface-variant"> — {b.author}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
