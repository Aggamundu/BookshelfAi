/**
 * @param {{ onAddManually: () => void }} props
 */
export default function HistoryPageHeader({ onAddManually }) {
  return (
    <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div className="space-y-4">
        <h2 className="font-headline text-4xl font-light leading-tight tracking-tight text-primary md:text-5xl">
          Pick your favorite books to help with recommendations.
        </h2>
        <p className="max-w-md font-body text-on-surface-variant">
          Select from your library to personalize your curated journey through literature.
        </p>
      </div>
      <button
        type="button"
        onClick={onAddManually}
        className="flex shrink-0 items-center gap-2 self-start rounded-xl bg-gradient-to-br from-primary to-primary-container px-6 py-3 text-on-primary shadow-sm duration-150 hover:opacity-90 active:scale-95 md:self-end"
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden>
          add
        </span>
        <span className="font-label text-sm font-medium">Add Manually</span>
      </button>
    </div>
  )
}
