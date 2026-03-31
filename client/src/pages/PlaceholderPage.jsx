import { Link } from 'react-router-dom'

export default function PlaceholderPage({ title }) {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="font-headline text-4xl text-primary">{title}</h1>
        <p className="mt-4 font-body text-on-surface-variant">This section is coming soon.</p>
        <Link to="/" className="mt-8 inline-block font-body text-sm text-primary underline">
          Back to home
        </Link>
      </main>
    </div>
  )
}
