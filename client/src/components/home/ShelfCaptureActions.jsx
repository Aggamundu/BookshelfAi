import { useRef } from 'react'

/**
 * @param {{ onFileSelected?: (file: File) => void, disabled?: boolean }} props
 */
export default function ShelfCaptureActions({ onFileSelected, disabled }) {
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  function handleChange(e) {
    if (disabled) return
    const file = e.target.files?.[0]
    if (file) {
      onFileSelected?.(file)
    }
    e.target.value = ''
  }

  return (
    <div
      className={`flex w-full flex-col justify-center space-y-6 ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
        aria-hidden
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*,.heic,.heif"
        className="hidden"
        onChange={handleChange}
        aria-hidden
      />

      <button
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        className="group flex w-full flex-col items-center justify-center gap-4 rounded-xl bg-gradient-to-br from-primary to-primary-container py-8 text-on-primary shadow-xl transition-all hover:opacity-90 active:scale-95"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-on-primary/10 transition-transform group-hover:scale-110">
          <span
            className="material-symbols-outlined text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden
          >
            add_a_photo
          </span>
        </div>
        <div className="text-center">
          <span className="block font-headline text-xl font-bold">
            {disabled ? 'Analyzing…' : 'Capture Shelf'}
          </span>
          <span className="block font-body text-sm opacity-70">
            {disabled ? 'Reading spines with AI' : 'Use your camera to scan'}
          </span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => galleryInputRef.current?.click()}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-surface-container-highest py-6 text-on-surface transition-all hover:opacity-80 active:scale-95"
      >
        <span className="material-symbols-outlined" aria-hidden>
          upload_file
        </span>
        <span className="font-body font-medium">{disabled ? 'Please wait…' : 'Upload from Gallery'}</span>
      </button>
    </div>
  )
}
