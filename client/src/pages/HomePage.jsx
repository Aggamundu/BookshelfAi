import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeroSection from '../components/home/HeroSection.jsx'
import IdentifiedBooksList from '../components/home/IdentifiedBooksList.jsx'
import ShelfCaptureActions from '../components/home/ShelfCaptureActions.jsx'
import TipsCard from '../components/home/TipsCard.jsx'
import SiteFooter from '../components/home/SiteFooter.jsx'
import LoadingBlock from '../components/ui/LoadingBlock.jsx'
import { useUser } from '../context/UserContext.jsx'
import { scanShelfImage } from '../lib/booksApi.js'
import { PAGE_FLOW_MAIN } from '../layout/pageLayout.js'
import { SHELF_PHOTO_KEY } from '../lib/flowStorage.js'

const SHELF_BOOKS_KEY = 'bookshelfai_shelfBooks'

function readStoredShelfBooks() {
  try {
    const raw = sessionStorage.getItem(SHELF_BOOKS_KEY)
    if (!raw) return []
    const p = JSON.parse(raw)
    if (!Array.isArray(p)) return []
    return p.filter((b) => b && typeof b.title === 'string')
  } catch {
    return []
  }
}

export default function HomePage() {
  const navigate = useNavigate()
  const { sessionReady, refreshSession } = useUser()
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState(null)
  const [identifiedBooks, setIdentifiedBooks] = useState(() =>
    typeof sessionStorage !== 'undefined' ? readStoredShelfBooks() : []
  )

  useEffect(() => {
    setIdentifiedBooks(readStoredShelfBooks())
  }, [])

  const hasIdentifiedBooks = identifiedBooks.length > 0

  const onFileSelected = useCallback(
    async (file) => {
      setScanError(null)
      setScanning(true)
      try {
        try {
          await refreshSession()
        } catch {
          /* scan still works; rate limit may use IP until session exists */
        }
        const books = await scanShelfImage(file)
        if (books.length === 0) {
          sessionStorage.removeItem(SHELF_PHOTO_KEY)
          sessionStorage.removeItem(SHELF_BOOKS_KEY)
          setIdentifiedBooks([])
          setScanError(
            'No book titles could be read from this image. Try a clearer photo, better lighting, or a closer shot of the spines.'
          )
          return
        }
        sessionStorage.setItem(SHELF_PHOTO_KEY, '1')
        sessionStorage.setItem(SHELF_BOOKS_KEY, JSON.stringify(books))
        setIdentifiedBooks(books)
      } catch (e) {
        console.error(e)
        sessionStorage.removeItem(SHELF_PHOTO_KEY)
        sessionStorage.removeItem(SHELF_BOOKS_KEY)
        setIdentifiedBooks([])
        if (e.status === 429) {
          const sec = e.body?.retryAfterSeconds ?? 60
          setScanError(`Too many scans right now. Please try again in about ${sec} seconds.`)
        } else {
          setScanError(e.message ?? 'Could not analyze this image. Try another photo.')
        }
      } finally {
        setScanning(false)
      }
    },
    [refreshSession]
  )

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <main className={`${PAGE_FLOW_MAIN} flex-grow items-center`}>
        <HeroSection />

        {!sessionReady ? (
          <p className="mb-4 font-body text-xs text-on-surface-variant">Connecting your session…</p>
        ) : null}

        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-12">
          <div className="mx-auto flex w-full max-w-lg flex-col justify-center space-y-6 md:col-span-12">
            <ShelfCaptureActions onFileSelected={onFileSelected} disabled={scanning} />
            <TipsCard />
          </div>
        </div>

        {scanning ? (
          <div className="mt-8 flex w-full justify-center">
            <div className="w-full max-w-lg">
            <LoadingBlock
              title="Identifying books on your shelf"
              subtitle="Uploading your image and reading spines with AI. This usually takes a few seconds."
            />
            </div>
          </div>
        ) : null}

        {scanError ? (
          <p
            className="mt-6 max-w-lg text-center font-body text-sm text-error"
            role="alert"
          >
            {scanError}
          </p>
        ) : null}

        <div className="mt-8 flex w-full max-w-lg flex-col items-center gap-3">
          <button
            type="button"
            disabled={!hasIdentifiedBooks || scanning}
            onClick={() => navigate('/preferences')}
            className="w-full rounded-xl bg-gradient-to-br from-primary to-primary-container px-6 py-4 font-body font-medium text-on-primary shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue to preferences
          </button>
          {!hasIdentifiedBooks && !scanning ? (
            <p className="text-center font-body text-xs text-on-surface-variant">
              Upload a shelf photo and wait for titles to appear below.
            </p>
          ) : null}
        </div>

        {!scanning && hasIdentifiedBooks ? (
          <div className="mt-8 flex w-full justify-center px-0">
            <IdentifiedBooksList books={identifiedBooks} />
          </div>
        ) : null}

        <p className="mt-10 max-w-lg text-center font-body text-sm text-on-surface-variant">
          We send your photo to the API (rate-limited) to read spines with OpenAI vision. Then you&apos;ll set
          genres, optionally add history, and get recommendations anchored to these titles.
        </p>
      </main>

      <SiteFooter />
    </div>
  )
}
