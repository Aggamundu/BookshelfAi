/**
 * @param {{ subtitle: string }} props
 */
export default function RecommendationsHero({ subtitle }) {
  return (
    <section className="mb-16">
      <h2 className="mb-4 font-headline text-5xl leading-tight text-primary md:text-7xl">
        Your Personalized <span className="italic">Recommendations</span>
      </h2>
      <p className="max-w-xl text-lg leading-relaxed text-on-surface-variant">{subtitle}</p>
    </section>
  )
}
