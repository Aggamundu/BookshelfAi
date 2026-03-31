import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FlowBack from '../components/flow/FlowBack.jsx'
import FlowStepper from '../components/flow/FlowStepper.jsx'
import RecommendationArticle from '../components/recommendations/RecommendationArticle.jsx'
import RecommendationsFooter from '../components/recommendations/RecommendationsFooter.jsx'
import RecommendationsHero from '../components/recommendations/RecommendationsHero.jsx'
import { useUser } from '../context/UserContext.jsx'
import { apiFetch } from '../lib/api.js'
import { hasPrefsCompleteSession, hasShelfPhotoSession } from '../lib/flowStorage.js'
import { getShelfBooksFromStorage } from '../lib/shelfBooks.js'

function buildHeroSubtitle(prefs, usedShelf) {
  const genres = prefs?.favorite_genres?.filter(Boolean) ?? []
  const genrePhrase = genres.length > 0 ? genres.slice(0, 3).join(', ') : null

  if (usedShelf) {
    return genrePhrase
      ? `Based on your recent shelf upload and affinity for ${genrePhrase}.`
      : `Based on your recent shelf upload and reading profile.`
  }
  return genrePhrase
    ? `Based on your reading history and preferences — including ${genrePhrase}.`
    : `Based on your reading history and curated preferences.`
}

function resolveBooksForRecommend(historyRows) {
  const fromShelf = getShelfBooksFromStorage()
  if (fromShelf?.length) {
    return { books: fromShelf, usedShelf: true }
  }
  const fromHistory = historyRows.slice(0, 10).map((h) => ({
    title: h.book_title,
    author: h.author || null,
  }))
  if (fromHistory.length) {
    return { books: fromHistory, usedShelf: false }
  }
  return { books: [], usedShelf: false }
}

export default function RecommendationsPage() {
  const { userId, sessionReady, sessionError } = useUser()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [prefs, setPrefs] = useState(null)
  const [usedShelf, setUsedShelf] = useState(false)
  const [hadBooksForRequest, setHadBooksForRequest] = useState(false)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    setHadBooksForRequest(false)
    try {
      const [histRes, prefRes] = await Promise.all([
        apiFetch(`/api/users/${userId}/history`),
        apiFetch(`/api/users/${userId}/preferences`),
      ])
      const historyRows = histRes.history ?? []
      const preferences = prefRes.preferences ?? {
        favorite_genres: [],
        favorite_authors: [],
        notes: null,
      }
      setPrefs(preferences)

      const { books, usedShelf: shelf } = resolveBooksForRecommend(historyRows)
      setUsedShelf(shelf)
      setHadBooksForRequest(books.length > 0)

      if (books.length === 0) {
        setItems([])
        setLoading(false)
        return
      }

      const rec = await apiFetch('/api/books/recommend', {
        method: 'POST',
        body: { userId, books },
      })
      setItems(Array.isArray(rec.recommendations) ? rec.recommendations : [])
    } catch (e) {
      console.error(e)
      setError(e.message ?? 'Could not load recommendations.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (!hasPrefsCompleteSession() || !hasShelfPhotoSession()) return
    if (!sessionReady || !userId) return
    load()
  }, [sessionReady, userId, load])

  const subtitle = useMemo(
    () => buildHeroSubtitle(prefs, usedShelf),
    [prefs, usedShelf]
  )

  const needsMoreContext =
    !loading &&
    !error &&
    items.length === 0 &&
    sessionReady &&
    userId &&
    !hadBooksForRequest

  if (!hasPrefsCompleteSession() || !hasShelfPhotoSession()) {
    return (
      <div className="min-h-screen bg-background font-body text-on-surface">
        <main className="mx-auto max-w-lg px-6 py-16 text-center">
          <FlowStepper step={4} />
          <h2 className="mt-8 font-headline text-3xl text-primary">Finish earlier steps first</h2>
          <p className="mt-4 font-body text-on-surface-variant">
            Add a shelf photo, then save your preferences, to see recommendations tied to the books we
            identified.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 font-body font-medium text-on-primary hover:opacity-90"
          >
            Start from the beginning
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-body text-on-surface">
      <main className="mx-auto max-w-6xl px-6 pt-8">
        <FlowBack to="/history">Reading history</FlowBack>
        <FlowStepper step={4} />
        <RecommendationsHero subtitle={subtitle} />

        {!sessionReady ? (
          <p className="mb-8 font-body text-sm text-on-surface-variant">Connecting session…</p>
        ) : null}
        {sessionError ? (
          <p className="mb-8 font-body text-sm text-error">Session error: {sessionError}</p>
        ) : null}

        {loading ? (
          <p className="font-body text-lg text-on-surface-variant">Curating your list…</p>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-error-container bg-error-container/20 px-6 py-8 text-center">
            <p className="font-body text-on-error-container">{error}</p>
            <button
              type="button"
              onClick={() => load()}
              className="mt-4 rounded-xl bg-primary px-6 py-3 font-body text-sm font-medium text-on-primary hover:opacity-90"
            >
              Try again
            </button>
          </div>
        ) : null}

        {needsMoreContext ? (
          <div className="rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low/50 px-6 py-12 text-center">
            <p className="font-body text-on-surface-variant">
              We don&apos;t have titles from your shelf photo in this session.{' '}
              <Link to="/" className="font-medium text-primary underline underline-offset-2">
                Upload a shelf photo
              </Link>{' '}
              on step 1, or add{' '}
              <Link to="/history" className="font-medium text-primary underline underline-offset-2">
                reading history
              </Link>{' '}
              so we can build a recommendation list.
            </p>
          </div>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <>
            <div className="space-y-24">
              {items.map((rec, index) => (
                <RecommendationArticle
                  key={`${rec.title}-${index}`}
                  title={rec.title}
                  author={rec.author ?? ''}
                  reason={rec.reason ?? ''}
                  index={index}
                />
              ))}
            </div>
            <RecommendationsFooter />
          </>
        ) : null}
      </main>
    </div>
  )
}
