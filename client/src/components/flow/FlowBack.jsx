import { Link } from 'react-router-dom'

/**
 * @param {{ to: string, children?: import('react').ReactNode }} props
 */
export default function FlowBack({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 font-body text-sm text-on-surface-variant transition-colors hover:text-primary"
    >
      <span className="material-symbols-outlined text-[20px]" aria-hidden>
        arrow_back
      </span>
      {children ?? 'Back'}
    </Link>
  )
}
