/**
 * @param {{ title: string, src?: string | null, alt?: string }} props
 */
export default function BookCoverPlaceholder({ title, src, alt }) {
  const initial = (title || '?').slice(0, 2).toUpperCase()

  if (src) {
    return (
      <div className="aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-xl bg-surface-container-highest shadow-sm md:w-32">
        <img src={src} alt={alt ?? title} className="h-full w-full object-cover" loading="lazy" />
      </div>
    )
  }

  return (
    <div
      className="flex aspect-[2/3] w-24 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest shadow-sm md:w-32"
      aria-hidden
    >
      <span className="font-headline text-2xl text-on-surface-variant/40">{initial}</span>
    </div>
  )
}
