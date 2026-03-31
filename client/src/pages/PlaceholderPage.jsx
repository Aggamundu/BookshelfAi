import { Link } from 'react-router-dom'
import { PAGE_MAIN_CLASS } from '../layout/pageLayout.js'

export default function PlaceholderPage({ title }) {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <main className={`${PAGE_MAIN_CLASS} py-16 text-center`}>
        <h1 className="font-headline text-4xl text-primary">{title}</h1>
        <p className="mt-4 font-body text-on-surface-variant">This section is coming soon.</p>
        <Link to="/" className="mt-8 inline-block font-body text-sm text-primary underline">
          Back to home
        </Link>
      </main>
    </div>
  )
}
