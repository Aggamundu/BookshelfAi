/**
 * @param {{ onNext: () => void, disabled?: boolean, saving?: boolean }} props
 */
export default function PreferencesAside({ onNext, disabled, saving }) {
  return (
    <aside className="space-y-12 md:col-span-4">
      <button
        type="button"
        onClick={onNext}
        disabled={disabled || saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container px-6 py-4 font-body font-medium text-on-primary shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>{saving ? 'Saving…' : 'Next'}</span>
        <span className="material-symbols-outlined text-sm" aria-hidden>
          ink_pen
        </span>
      </button>
    </aside>
  )
}
