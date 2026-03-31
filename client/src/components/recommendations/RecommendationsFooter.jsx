import { Link } from 'react-router-dom'

export default function RecommendationsFooter() {
  return (
    <footer className="mt-32 border-t border-outline-variant/10 pb-12 pt-12 text-center">
      <p className="mb-4 text-on-surface-variant">Not quite what you&apos;re looking for?</p>
      <Link
        to="/preferences"
        className="inline-flex items-center gap-2 text-lg font-semibold text-primary underline-offset-8 transition-all hover:underline"
      >
        Refine Recommendations
        <span className="material-symbols-outlined" aria-hidden>
          tune
        </span>
      </Link>
    </footer>
  )
}
