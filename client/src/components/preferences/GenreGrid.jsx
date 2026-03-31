import GenreCard from './GenreCard.jsx'
import { GENRE_OPTIONS } from './genreOptions.js'

/**
 * @param {{ selectedIds: Set<string>, onToggle: (id: string) => void }} props
 */
export default function GenreGrid({ selectedIds, onToggle }) {
  return (
    <div className="space-y-8 md:col-span-8">
      <div className="flex items-end justify-between">
        <h2 className="font-headline text-3xl">Favorite Genres</h2>
        <span className="font-sans text-sm italic text-on-surface-variant opacity-60">Select multiple</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {GENRE_OPTIONS.map((genre) => (
          <GenreCard
            key={genre.id}
            genre={genre}
            selected={selectedIds.has(genre.id)}
            onToggle={() => onToggle(genre.id)}
          />
        ))}
      </div>
    </div>
  )
}
