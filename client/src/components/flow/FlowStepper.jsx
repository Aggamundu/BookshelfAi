import { Link } from 'react-router-dom'

const STEPS = [
  { label: 'Shelf photo', path: '/' },
  { label: 'Preferences', path: '/preferences' },
  { label: 'Reading history', path: '/history' },
  { label: 'Recommendations', path: '/recommendations' },
]

const linkFocus =
  'rounded-xl outline-none ring-offset-2 ring-offset-surface transition-[transform,opacity] hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary'

/**
 * @param {{ step: number }} props — 1-based index
 */
export default function FlowStepper({ step }) {
  return (
    <div
      className="w-full"
      role="navigation"
      aria-label="Onboarding steps"
    >
      <ol className="flex flex-row items-start justify-between gap-1 sm:gap-3">
        {STEPS.map((s, i) => {
          const n = i + 1
          const active = n === step
          const done = n < step
          const tone = active ? 'text-primary' : done ? 'text-on-surface-variant' : 'text-on-surface-variant/50'
          return (
            <li key={s.label} className={`min-w-0 flex-1 ${tone}`}>
              <Link
                to={s.path}
                className={`flex flex-col items-center gap-1.5 px-1 py-0.5 text-center sm:gap-2 ${linkFocus}`}
                aria-current={active ? 'step' : undefined}
                aria-label={active ? undefined : `Go to ${s.label}`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-label text-xs font-semibold transition-transform hover:scale-105 sm:h-9 sm:w-9 sm:text-sm ${
                    active
                      ? 'bg-primary text-on-primary'
                      : done
                        ? 'bg-primary/15 text-primary'
                        : 'bg-surface-variant text-on-surface-variant'
                  }`}
                >
                  {done ? (
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]" aria-hidden>
                      check
                    </span>
                  ) : (
                    n
                  )}
                </span>
                <span
                  className={`max-w-[4.5rem] font-label text-[9px] uppercase leading-tight tracking-tight sm:max-w-none sm:text-[11px] sm:tracking-wider md:text-xs ${
                    active ? 'font-semibold' : 'font-medium'
                  }`}
                >
                  {s.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface-variant sm:mt-4">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          aria-hidden
        />
      </div>
    </div>
  )
}
