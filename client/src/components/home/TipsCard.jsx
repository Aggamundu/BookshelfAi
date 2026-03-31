export default function TipsCard() {
  const tips = [
    'Ensure book spines are clearly visible',
    'Shoot in natural daylight if possible',
    'Keep the camera steady and parallel to the shelf',
  ]

  return (
    <div className="rounded-xl bg-surface-container p-6">
      <h3 className="mb-3 flex items-center gap-2 font-headline text-lg font-bold">
        <span className="material-symbols-outlined text-sm" aria-hidden>
          lightbulb
        </span>
        For Best Results
      </h3>
      <ul className="space-y-3 font-body text-sm text-on-surface-variant">
        {tips.map((tip) => (
          <li key={tip} className="flex items-start gap-2">
            <span className="mt-1 text-primary">•</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  )
}
