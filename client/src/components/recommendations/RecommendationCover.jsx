/**
 * @param {{ title: string, imageUrl?: string | null, variant?: 'primary' | 'secondary' | 'tertiary', imageAlign?: 'start' | 'end' }} props
 */
export default function RecommendationCover({
  title,
  imageUrl,
  variant = 'primary',
  imageAlign = 'end',
}) {
  const initial = (title || '?').slice(0, 2).toUpperCase()

  const offsetClass = {
    primary: 'bg-primary/5 translate-x-4 translate-y-4 group-hover:translate-x-6 group-hover:translate-y-6',
    secondary: 'bg-secondary-container/20 -translate-x-4 translate-y-4 group-hover:-translate-x-6 group-hover:translate-y-6',
    tertiary: 'bg-tertiary-fixed/30 translate-x-4 translate-y-4 group-hover:translate-x-6 group-hover:translate-y-6',
  }[variant]

  const justify =
    imageAlign === 'start'
      ? 'justify-center md:justify-start'
      : 'justify-center md:justify-end'

  const inner = imageUrl ? (
    <img
      src={imageUrl}
      alt={title}
      className="book-shadow aspect-[2/3] w-64 rounded-xl object-cover md:w-80"
      loading="lazy"
    />
  ) : (
    <div className="book-shadow flex aspect-[2/3] w-64 items-center justify-center rounded-xl bg-surface-container-highest md:w-80">
      <span className="font-headline text-4xl text-on-surface-variant/35">{initial}</span>
    </div>
  )

  return (
    <div className={`group relative flex w-full max-w-[20rem] md:max-w-none ${justify}`}>
      <div className="relative">
        <div className={`absolute inset-0 -z-10 rounded-xl transition-transform ${offsetClass}`} aria-hidden />
        {inner}
      </div>
    </div>
  )
}
