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
import { PAGE_FLOW_MAIN, PAGE_MAIN_CLASS } from '../layout/pageLayout.js'
import { hasShelfPhotoSession, setPrefsCompleteSession } from '../lib/flowStorage.js'

export default function PreferencesPage() {
  const navigate = useNavigate()
  const { userId, sessionReady, sessionError } = useUser()
  const [selectedIds, setSelectedIds] = useState(() => new Set([GENRE_OPTIONS[0].id]))
  const [saving, setSaving] = useState(false)

  const toggleGenre = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        if (next.size <= 1) return prev
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const canSave = sessionReady && userId && !sessionError

  const hasAtLeastOneGenre = selectedIds.size >= 1

  const handleNext = useCallback(async () => {
    if (!userId) return
    if (selectedIds.size < 1) return
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

  const asideDisabled = useMemo(
    () => !canSave || saving || !hasAtLeastOneGenre,
    [canSave, saving, hasAtLeastOneGenre]
  )

  if (!hasShelfPhotoSession()) {
    return (
      <div className="min-h-screen bg-surface font-body text-on-surface">
        <main className={`${PAGE_MAIN_CLASS} flex flex-col gap-8 py-16 text-center`}>
          <FlowStepper step={2} />
          <h2 className="font-headline text-3xl text-primary">Start with a shelf photo</h2>
          <p className="font-body text-on-surface-variant">
            Add a picture of your bookshelf first so we know which titles to work from.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 font-body font-medium text-on-primary hover:opacity-90"
          >
            Go to step 1
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface md:pb-0">
      <main className={PAGE_FLOW_MAIN}>
        <FlowBack to="/">Shelf photo</FlowBack>
        <FlowStepper step={2} />
        <PreferencesHeader />

        <section className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="space-y-4 md:col-span-8">
            <GenreGrid selectedIds={selectedIds} onToggle={toggleGenre} />
            {canSave && !hasAtLeastOneGenre ? (
              <p className="font-body text-sm text-error" role="status">
                Select at least one genre to continue.
              </p>
            ) : null}
          </div>
          <PreferencesAside onNext={handleNext} disabled={asideDisabled} saving={saving} />
        </section>

        {!sessionReady ? (
          <p className="font-body text-sm text-on-surface-variant">Connecting session…</p>
        ) : null}

        <LiteraryQuote />
      </main>
    </div>
  )
}
