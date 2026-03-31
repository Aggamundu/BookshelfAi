export default function StepProgress({ step = 1, total = 3 }) {
  return (
    <div className="mt-16 flex items-center gap-4" role="navigation" aria-label="Onboarding progress">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={
            i === step - 1
              ? 'h-1.5 w-12 rounded-full bg-primary'
              : 'h-1.5 w-4 rounded-full bg-surface-variant'
          }
        />
      ))}
    </div>
  )
}
