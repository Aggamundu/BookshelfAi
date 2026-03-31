/**
 * Accessible loading indicator with optional subtitle.
 * @param {{ title: string, subtitle?: string, className?: string }} props
 */
export default function LoadingBlock({ title, subtitle, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-10 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-11 w-11 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
        aria-hidden
      />
      <div className="text-center">
        <p className="font-headline text-lg text-primary">{title}</p>
        {subtitle ? (
          <p className="mt-2 max-w-md font-body text-sm text-on-surface-variant">{subtitle}</p>
        ) : null}
      </div>
    </div>
  )
}
