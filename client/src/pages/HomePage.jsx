import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FlowStepper from '../components/flow/FlowStepper.jsx'
import HeroSection from '../components/home/HeroSection.jsx'
import ShelfCaptureActions from '../components/home/ShelfCaptureActions.jsx'
import TipsCard from '../components/home/TipsCard.jsx'
import SiteFooter from '../components/home/SiteFooter.jsx'
import { SHELF_PHOTO_KEY } from '../lib/flowStorage.js'
import { MOCK_SHELF_BOOKS_FROM_PHOTO } from '../lib/mockShelfBooks.js'

const SHELF_BOOKS_KEY = 'bookshelfai_shelfBooks'

export default function HomePage() {
  const navigate = useNavigate()
  const [hasPhoto, setHasPhoto] = useState(() =>
    typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(SHELF_PHOTO_KEY) === '1' : false
  )

  useEffect(() => {
    setHasPhoto(sessionStorage.getItem(SHELF_PHOTO_KEY) === '1')
  }, [])

  const onFileSelected = useCallback((file) => {
    sessionStorage.setItem(SHELF_PHOTO_KEY, '1')
    sessionStorage.setItem(SHELF_BOOKS_KEY, JSON.stringify(MOCK_SHELF_BOOKS_FROM_PHOTO))
    setHasPhoto(true)
    if (import.meta.env.DEV) {
      console.debug('[Archivist] shelf photo set (UI mock titles)', file.name)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <main className="mx-auto flex w-full max-w-4xl flex-grow flex-col items-center px-6 py-12">
        <FlowStepper step={1} />

        <HeroSection />

        <p className="mb-6 max-w-lg text-center font-body text-sm text-on-surface-variant">
          Your photo supplies the titles we match against. Next you&apos;ll choose genres you love; then you can
          optionally add reading history before we generate suggestions.
        </p>

        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-12">
          <div className="mx-auto flex w-full max-w-lg flex-col justify-center space-y-6 md:col-span-12">
            <ShelfCaptureActions onFileSelected={onFileSelected} />
            <TipsCard />
          </div>
        </div>

        <div className="mt-10 flex w-full max-w-lg flex-col items-center gap-3">
          <button
            type="button"
            disabled={!hasPhoto}
            onClick={() => navigate('/preferences')}
            className="w-full rounded-xl bg-gradient-to-br from-primary to-primary-container px-6 py-4 font-body font-medium text-on-primary shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue to preferences
          </button>
          {!hasPhoto ? (
            <p className="text-center font-body text-xs text-on-surface-variant">
              Choose a shelf photo to continue.
            </p>
          ) : null}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
