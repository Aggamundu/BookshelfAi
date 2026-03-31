import { SURFACE_CLASS } from './genreOptions.js'

/**
 * @param {{ id: string, label: string, icon: string, surface: keyof typeof SURFACE_CLASS }} genre
 * @param {boolean} selected
 * @param {() => void} onToggle
 */
export default function GenreCard({ genre, selected, onToggle }) {
  const bg = SURFACE_CLASS[genre.surface] ?? SURFACE_CLASS.container

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={`group relative flex aspect-[4/3] flex-col items-start justify-end overflow-hidden rounded-xl p-6 transition-transform hover:scale-[0.98] ${bg}`}
    >
      <div
        className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
          selected
            ? 'border-primary bg-primary'
            : 'border-outline-variant group-hover:border-primary'
        }`}
      >
        {selected ? (
          <span
            className="material-symbols-outlined text-xs text-on-primary"
            style={{ fontVariationSettings: "'wght' 700" }}
            aria-hidden
          >
            check
          </span>
        ) : null}
      </div>

      <span
        className="material-symbols-outlined mb-2 text-4xl text-on-surface-variant transition-colors group-hover:text-primary"
        aria-hidden
      >
        {genre.icon}
      </span>
      <span className="font-headline text-xl">{genre.label}</span>
    </button>
  )
}
