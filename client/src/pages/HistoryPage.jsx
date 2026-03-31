import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FlowBack from '../components/flow/FlowBack.jsx'
import FlowStepper from '../components/flow/FlowStepper.jsx'
import AddBookManualModal from '../components/history/AddBookManualModal.jsx'
import GenerateRecommendationsCta from '../components/history/GenerateRecommendationsCta.jsx'
import HistoryPageHeader from '../components/history/HistoryPageHeader.jsx'
import HistorySummaryCard from '../components/history/HistorySummaryCard.jsx'
import ShelfQuickAdd from '../components/history/ShelfQuickAdd.jsx'
import { useUser } from '../context/UserContext.jsx'
import { apiFetch } from '../lib/api.js'
import { hasPrefsCompleteSession } from '../lib/flowStorage.js'
import { PAGE_FLOW_MAIN, PAGE_MAIN_CLASS } from '../layout/pageLayout.js'
import { getShelfBooksFromStorage } from '../lib/shelfBooks.js'

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
          rating: payload.rating ?? null,
        },
      })
      await loadHistory()
    },
    [userId, loadHistory]
  )

  const handleAddFromShelf = useCallback(
    async (book) => {
      await handleAddBook({
        book_title: book.title,
        author: book.author,
      })
    },
    [handleAddBook]
  )

  const shelfBooks = getShelfBooksFromStorage() ?? []

  const handleGenerate = useCallback(() => {
    navigate('/recommendations')
  }, [navigate])

  if (!hasPrefsCompleteSession()) {
    return (
      <div className="min-h-screen bg-surface font-body text-on-surface">
        <main className={`${PAGE_MAIN_CLASS} flex flex-col gap-8 py-16 text-center`}>
          <FlowStepper step={3} />
          <h2 className="font-headline text-3xl text-primary">Complete preferences first</h2>
          <p className="font-body text-on-surface-variant">
            Choose your favorite genres before adding optional reading history.
          </p>
          <Link
            to="/preferences"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 font-body font-medium text-on-primary hover:opacity-90"
          >
            Go to step 2
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <main className={PAGE_FLOW_MAIN}>
        <FlowBack to="/preferences">Preferences</FlowBack>
        <FlowStepper step={3} />
        <p className="max-w-xl font-body text-sm text-on-surface-variant">
          Optional: add books you&apos;ve loved. Recommendations are generated from the titles identified in your
          shelf photo, refined by your genres and any history you add here.
        </p>
        <HistoryPageHeader onAddManually={() => setModalOpen(true)} />

        <ShelfQuickAdd
          shelfBooks={shelfBooks}
          entries={entries}
          onAdd={handleAddFromShelf}
          disabled={!sessionReady || !!sessionError}
        />

        {!loading && entries.length > 0 ? <HistorySummaryCard entries={entries} /> : null}

        {!sessionReady ? (
          <p className="font-body text-sm text-on-surface-variant">Connecting session…</p>
        ) : null}

        {loading ? (
          <p className="font-body text-on-surface-variant">Loading your library…</p>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low/50 px-6 py-12 text-center">
            <p className="font-body text-on-surface-variant">
              No books yet. Use <strong className="text-on-surface">Add Manually</strong> or quick add from your
              shelf above.
            </p>
          </div>
        ) : null}

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
