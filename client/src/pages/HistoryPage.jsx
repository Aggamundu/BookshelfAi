import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FlowBack from '../components/flow/FlowBack.jsx'
import FlowStepper from '../components/flow/FlowStepper.jsx'
import AddBookManualModal from '../components/history/AddBookManualModal.jsx'
import GenerateRecommendationsCta from '../components/history/GenerateRecommendationsCta.jsx'
import HistoryList from '../components/history/HistoryList.jsx'
import HistoryPageHeader from '../components/history/HistoryPageHeader.jsx'
import { useUser } from '../context/UserContext.jsx'
import { apiFetch } from '../lib/api.js'
import { hasPrefsCompleteSession } from '../lib/flowStorage.js'

export default function HistoryPage() {
  const navigate = useNavigate()
  const { userId, sessionReady, sessionError } = useUser()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const loadHistory = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const data = await apiFetch(`/api/users/${userId}/history`)
      setEntries(data.history ?? [])
    } catch (e) {
      console.error(e)
      window.alert(e.message ?? 'Could not load reading history.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (!sessionReady || !userId) return
    loadHistory()
  }, [sessionReady, userId, loadHistory])

  const handleAddBook = useCallback(
    async (payload) => {
      if (!userId) return
      await apiFetch(`/api/users/${userId}/history`, {
        method: 'POST',
        body: {
          book_title: payload.book_title,
          author: payload.author,
          status: 'read',
          rating: payload.rating,
        },
      })
      await loadHistory()
    },
    [userId, loadHistory]
  )

  const handleGenerate = useCallback(() => {
    navigate('/recommendations')
  }, [navigate])

  if (!hasPrefsCompleteSession()) {
    return (
      <div className="min-h-screen bg-surface font-body text-on-surface">
        <main className="mx-auto max-w-lg px-6 py-16 text-center">
          <FlowStepper step={3} />
          <h2 className="mt-8 font-headline text-3xl text-primary">Complete preferences first</h2>
          <p className="mt-4 font-body text-on-surface-variant">
            Choose your favorite genres before adding optional reading history.
          </p>
          <Link
            to="/preferences"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 font-body font-medium text-on-primary hover:opacity-90"
          >
            Go to step 2
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <main className="mx-auto max-w-4xl px-6 py-8">
        <FlowBack to="/preferences">Preferences</FlowBack>
        <FlowStepper step={3} />
        <p className="mb-8 max-w-xl font-body text-sm text-on-surface-variant">
          Optional: add books you&apos;ve loved. Recommendations are generated from the titles identified in your
          shelf photo, refined by your genres and any history you add here.
        </p>
        <HistoryPageHeader onAddManually={() => setModalOpen(true)} />

        {!sessionReady ? (
          <p className="mb-8 font-body text-sm text-on-surface-variant">Connecting session…</p>
        ) : null}
        {sessionError ? (
          <p className="mb-8 font-body text-sm text-error">Session error: {sessionError}</p>
        ) : null}

        {loading ? (
          <p className="font-body text-on-surface-variant">Loading your library…</p>
        ) : (
          <HistoryList entries={entries} />
        )}

        <GenerateRecommendationsCta onClick={handleGenerate} disabled={!sessionReady || !!sessionError} />
      </main>

      <AddBookManualModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddBook}
      />
    </div>
  )
}
