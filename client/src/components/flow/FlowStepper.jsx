const STEPS = [
  { label: 'Shelf photo' },
  { label: 'Preferences' },
  { label: 'Reading history' },
  { label: 'Recommendations' },
]

/**
 * @param {{ step: number }} props — 1-based index
 */
export default function FlowStepper({ step }) {
  return (
    <div
      className="mb-10 w-full max-w-2xl"
      role="navigation"
      aria-label="Onboarding steps"
    >
      <ol className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
        {STEPS.map((s, i) => {
          const n = i + 1
          const active = n === step
          const done = n < step
          return (
            <li
              key={s.label}
              className={`flex flex-1 flex-col items-center gap-2 text-center sm:min-w-0 ${
                active ? 'text-primary' : done ? 'text-on-surface-variant' : 'text-on-surface-variant/50'
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-label text-sm font-semibold ${
                  active
                    ? 'bg-primary text-on-primary'
                    : done
                      ? 'bg-primary/15 text-primary'
                      : 'bg-surface-variant text-on-surface-variant'
                }`}
                aria-current={active ? 'step' : undefined}
              >
                {done ? (
                  <span className="material-symbols-outlined text-[18px]" aria-hidden>
                    check
                  </span>
                ) : (
                  n
                )}
              </span>
              <span
                className={`font-label text-[11px] uppercase tracking-wider sm:text-xs ${
                  active ? 'font-semibold' : 'font-medium'
                }`}
              >
                {s.label}
              </span>
            </li>
          )
        })}
      </ol>
      <div className="mt-4 hidden h-1 w-full overflow-hidden rounded-full bg-surface-variant sm:block">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          aria-hidden
        />
      </div>
    </div>
  )
}
