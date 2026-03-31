import BookCoverPlaceholder from './BookCoverPlaceholder.jsx'
import StarRating from './StarRating.jsx'

/**
 * @param {{
 *   title: string
 *   author?: string | null
 *   rating?: number | null
 *   tags?: string[]
 *   quote?: string | null
 *   coverUrl?: string | null
 * }} props
 */
export default function HistoryBookCard({ title, author, rating, tags = [], quote, coverUrl }) {
  return (
    <div className="group -mx-4 flex items-start gap-6 rounded-xl border border-transparent p-4 transition-colors hover:border-outline-variant/10 hover:bg-surface-container-lowest">
      <BookCoverPlaceholder title={title} src={coverUrl} />

      <div className="min-w-0 flex-grow space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h4 className="font-headline text-2xl leading-tight text-on-surface transition-colors group-hover:text-primary">
              {title}
            </h4>
            {author ? <p className="font-body text-sm text-on-surface-variant">{author}</p> : null}
          </div>
          {rating != null && rating > 0 ? <StarRating value={rating} /> : null}
        </div>

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-container-high px-3 py-1 font-label text-[10px] uppercase italic tracking-tighter text-on-surface-variant"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {quote ? (
          <p className="line-clamp-2 pt-2 font-body text-sm italic text-on-surface-variant md:line-clamp-none">
            {quote}
          </p>
        ) : null}
      </div>
    </div>
  )
}
