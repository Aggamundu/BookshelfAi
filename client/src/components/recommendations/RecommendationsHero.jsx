/**
 * @param {{ subtitle: string, source?: 'cache' | 'ai' | null }} props
 */
export default function RecommendationsHero({ subtitle, source }) {
  return (
    <section>
      <h2 className="mb-4 font-headline text-5xl leading-tight text-primary md:text-7xl">
        Your Personalized <span className="italic">Recommendations</span>
      </h2>
      <p className="max-w-xl text-lg leading-relaxed text-on-surface-variant">{subtitle}</p>
      {source === 'cache' ? (
        <p className="mt-4 font-label text-xs font-medium uppercase tracking-wider text-on-surface-variant">
          Instant result (cached)
        </p>
      ) : source === 'ai' ? (
        <p className="mt-4 font-label text-xs font-medium uppercase tracking-wider text-on-surface-variant">
          Generated with OpenAI (stored in cache for repeats)
        </p>
      ) : null}
    </section>
  )
}
