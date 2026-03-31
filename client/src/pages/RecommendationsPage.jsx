import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FlowBack from '../components/flow/FlowBack.jsx'
import FlowStepper from '../components/flow/FlowStepper.jsx'
import RecommendationArticle from '../components/recommendations/RecommendationArticle.jsx'
import RecommendationsFooter from '../components/recommendations/RecommendationsFooter.jsx'
import RecommendationsHero from '../components/recommendations/RecommendationsHero.jsx'
import LoadingBlock from '../components/ui/LoadingBlock.jsx'
import { useUser } from '../context/UserContext.jsx'
import { apiFetch } from '../lib/api.js'
import { hasPrefsCompleteSession, hasShelfPhotoSession } from '../lib/flowStorage.js'
import { PAGE_FLOW_MAIN, PAGE_MAIN_CLASS } from '../layout/pageLayout.js'
import { getShelfBooksFromStorage } from '../lib/shelfBooks.js'

function buildHeroSubtitle(prefs) {
  const genres = prefs?.favorite_genres?.filter(Boolean) ?? []
  const genrePhrase = genres.length > 0 ? genres.slice(0, 3).join(', ') : null
  return genrePhrase
    ? `Based on the books we identified on your shelf and your affinity for ${genrePhrase}.`
    : `Based on the books we identified on your shelf and your saved preferences.`
}

export default function RecommendationsPage() {
  const { userId, sessionReady, sessionError } = useUser()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [prefs, setPrefs] = useState(null)
  const [hadBooksForRequest, setHadBooksForRequest] = useState(false)
  const [recSource, setRecSource] = useState(null)
  const [loadPhase, setLoadPhase] = useState(null)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setLoadPhase('prefs')
    setError(null)
    setHadBooksForRequest(false)
    setRecSource(null)
    try {
      const prefRes = await apiFetch(`/api/users/${userId}/preferences`)
      const preferences = prefRes.preferences ?? {
        favorite_genres: [],
        favorite_authors: [],
        notes: null,
      }
      setPrefs(preferences)

      const books = getShelfBooksFromStorage() ?? []
      setHadBooksForRequest(books.length > 0)

      if (books.length === 0) {
        setItems([])
        setLoadPhase(null)
        setLoading(false)
        return
      }

      setLoadPhase('recommend')
      const rec = await apiFetch('/api/books/recommend', {
        method: 'POST',
        body: { userId, books },
      })
      setItems(Array.isArray(rec.recommendations) ? rec.recommendations : [])
      setRecSource(rec.source === 'cache' || rec.source === 'ai' ? rec.source : null)
    } catch (e) {
      console.error(e)
      if (e.status === 429) {
        const sec = e.body?.retryAfterSeconds ?? 60
        setError(`Too many requests. Try again in about ${sec} seconds.`)
      } else {
        setError(e.message ?? 'Could not load recommendations.')
      }
      setItems([])
    } finally {
      setLoadPhase(null)
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (!hasPrefsCompleteSession() || !hasShelfPhotoSession()) return
    if (!sessionReady || !userId) return
    load()
  }, [sessionReady, userId, load])

  useEffect(() => {
    if (!sessionReady || !userId) {
      setLoading(false)
      setLoadPhase(null)
    }
  }, [sessionReady, userId])

  const subtitle = useMemo(() => buildHeroSubtitle(prefs), [prefs])

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
        <main className={`${PAGE_MAIN_CLASS} flex flex-col gap-8 py-16 text-center`}>
          <FlowStepper step={4} />
          <h2 className="font-headline text-3xl text-primary">Finish earlier steps first</h2>
          <p className="font-body text-on-surface-variant">
            Add a shelf photo, then save your preferences, to see recommendations tied to the books we
            identified.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 font-body font-medium text-on-primary hover:opacity-90"
          >
            Start from the beginning
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-body text-on-surface">
      <main className={PAGE_FLOW_MAIN}>
        <FlowBack to="/history">Reading history</FlowBack>
        <FlowStepper step={4} />
        {!loading ? <RecommendationsHero subtitle={subtitle} source={recSource} /> : null}

        {!sessionReady ? (
          <p className="font-body text-sm text-on-surface-variant">Connecting session…</p>
        ) : null}

        {loading && sessionReady && !sessionError ? (
          <LoadingBlock
            title={
              loadPhase === 'recommend'
                ? 'Generating recommendations'
                : 'Loading your preferences'
            }
            subtitle={
              loadPhase === 'recommend'
                ? 'Matching your shelf to new titles with AI. Cached results load instantly when available.'
                : 'Fetching your saved genres and notes.'
            }
          />
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
              Recommendations use only books identified from your shelf photo. We don&apos;t have that list in
              this session —{' '}
              <Link to="/" className="font-medium text-primary underline underline-offset-2">
                go back to step 1
              </Link>{' '}
              and run the scan again.
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
