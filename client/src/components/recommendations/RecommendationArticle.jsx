import RecommendationCover from './RecommendationCover.jsx'

const BADGES = [
  {
    label: 'TOP MATCH',
    className: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    icon: 'auto_stories',
    iconFill: true,
    coverVariant: 'primary',
  },
  {
    label: 'MODERN CLASSIC',
    className: 'bg-secondary-container text-on-secondary-container',
    icon: 'history_edu',
    iconFill: false,
    coverVariant: 'secondary',
  },
  {
    label: 'GREAT FIT',
    className: 'bg-primary-fixed text-on-primary-fixed-variant',
    icon: 'eco',
    iconFill: false,
    coverVariant: 'tertiary',
  },
]

/**
 * @param {{
 *   title: string
 *   author: string
 *   reason: string
 *   index: number
 *   imageUrl?: string | null
 * }} props
 */
export default function RecommendationArticle({ title, author, reason, index, imageUrl }) {
  const flipped = index % 2 === 1
  const badge = BADGES[index % BADGES.length]
  const searchHref = `https://www.google.com/search?q=${encodeURIComponent(`${title} ${author} book`)}`

  const quoteBlock = (
    <div className="relative mb-8 rounded-xl bg-surface-container-low p-6">
      <span
        className={`material-symbols-outlined absolute -top-3 text-5xl text-primary/10 ${
          flipped ? '-right-3 scale-x-[-1]' : '-left-3'
        }`}
        aria-hidden
      >
        format_quote
      </span>
      <p className="text-pretty leading-relaxed text-on-surface italic">&ldquo;{reason}&rdquo;</p>
    </div>
  )

  const actions = (
    <div className={`flex flex-wrap gap-4 ${flipped ? 'justify-end' : ''}`}>
      <a
        href={searchHref}
        target="_blank"
        rel="noreferrer"
        className="rounded-xl bg-surface-container-highest px-6 py-4 font-medium text-on-surface transition-opacity hover:opacity-80"
      >
        View Details
      </a>
    </div>
  )

  const meta = (
    <>
      <div
        className={`mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wider ${badge.className}`}
      >
        <span
          className="material-symbols-outlined text-sm"
          style={badge.iconFill ? { fontVariationSettings: "'FILL' 1" } : undefined}
          aria-hidden
        >
          {badge.icon}
        </span>
        {badge.label}
      </div>
      <h3 className="mb-2 font-headline text-4xl text-primary">{title}</h3>
      <p className="mb-6 font-headline text-xl italic text-on-surface-variant">{author}</p>
      {quoteBlock}
      {actions}
    </>
  )

  const cover = (
    <RecommendationCover
      title={title}
      imageUrl={imageUrl}
      variant={badge.coverVariant}
      imageAlign={flipped ? 'start' : 'end'}
    />
  )

  if (flipped) {
    return (
      <article className="flex flex-col items-center gap-12 md:flex-row-reverse md:gap-20">
        <div className="flex w-full md:w-1/2">{cover}</div>
        <div className="flex w-full flex-col md:w-1/2 md:items-end md:text-right">{meta}</div>
      </article>
    )
  }

  return (
    <article className="flex flex-col items-center gap-12 md:flex-row md:gap-20">
      <div className="flex w-full md:w-1/2">{cover}</div>
      <div className="w-full md:w-1/2">{meta}</div>
    </article>
  )
}
