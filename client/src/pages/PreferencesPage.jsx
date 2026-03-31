import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FlowBack from '../components/flow/FlowBack.jsx'
import FlowStepper from '../components/flow/FlowStepper.jsx'
import PreferencesHeader from '../components/preferences/PreferencesHeader.jsx'
import GenreGrid from '../components/preferences/GenreGrid.jsx'
import PreferencesAside from '../components/preferences/PreferencesAside.jsx'
import LiteraryQuote from '../components/preferences/LiteraryQuote.jsx'
import { GENRE_OPTIONS } from '../components/preferences/genreOptions.js'
import { useUser } from '../context/UserContext.jsx'
import { apiFetch } from '../lib/api.js'
import { hasShelfPhotoSession, setPrefsCompleteSession } from '../lib/flowStorage.js'

export default function PreferencesPage() {
  const navigate = useNavigate()
  const { userId, sessionReady, sessionError } = useUser()
  const [selectedIds, setSelectedIds] = useState(() => new Set(['sci-fi', 'classics']))
  const [saving, setSaving] = useState(false)

  const toggleGenre = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const canSave = sessionReady && userId && !sessionError

  const handleNext = useCallback(async () => {
    if (!userId) return
    const favorite_genres = GENRE_OPTIONS.filter((g) => selectedIds.has(g.id)).map((g) => g.label)
    setSaving(true)
    try {
      await apiFetch(`/api/users/${userId}/preferences`, {
        method: 'PUT',
        body: { favorite_genres, favorite_authors: [], notes: null },
      })
      setPrefsCompleteSession()
      navigate('/history')
    } catch (e) {
      console.error(e)
      window.alert(e.message ?? 'Could not save preferences.')
    } finally {
      setSaving(false)
    }
  }, [userId, selectedIds, navigate])

  const asideDisabled = useMemo(() => !canSave || saving, [canSave, saving])

  if (!hasShelfPhotoSession()) {
    return (
      <div className="min-h-screen bg-surface font-body text-on-surface">
        <main className="mx-auto max-w-lg px-6 py-16 text-center">
          <FlowStepper step={2} />
          <h2 className="mt-8 font-headline text-3xl text-primary">Start with a shelf photo</h2>
          <p className="mt-4 font-body text-on-surface-variant">
            Add a picture of your bookshelf first so we know which titles to work from.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 font-body font-medium text-on-primary hover:opacity-90"
          >
            Go to step 1
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface md:pb-0">
      <main className="mx-auto max-w-5xl px-6 py-12">
        <FlowBack to="/">Shelf photo</FlowBack>
        <FlowStepper step={2} />
        <PreferencesHeader />

        <section className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <GenreGrid selectedIds={selectedIds} onToggle={toggleGenre} />
          <PreferencesAside onNext={handleNext} disabled={asideDisabled} saving={saving} />
        </section>

        {!sessionReady ? (
          <p className="mt-8 font-body text-sm text-on-surface-variant">Connecting session…</p>
        ) : null}
        {sessionError ? (
          <p className="mt-8 font-body text-sm text-error">Session error: {sessionError}</p>
        ) : null}

        <LiteraryQuote />
      </main>
    </div>
  )
}
