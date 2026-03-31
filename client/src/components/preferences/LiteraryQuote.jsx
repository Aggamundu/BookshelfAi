export default function LiteraryQuote() {
  return (
    <section className="mb-12 mt-24 border-t border-outline-variant/10 py-16 text-center">
      <div className="mx-auto max-w-2xl">
        <span className="material-symbols-outlined mb-4 text-4xl text-primary-container opacity-20" aria-hidden>
          format_quote
        </span>
        <p className="font-headline text-3xl italic leading-snug text-on-surface-variant">
          &ldquo;A library is not a luxury but one of the necessities of life.&rdquo;
        </p>
        <cite className="mt-6 block font-sans text-xs uppercase tracking-[0.2em] text-outline">
          — Henry Ward Beecher
        </cite>
      </div>
    </section>
  )
}
