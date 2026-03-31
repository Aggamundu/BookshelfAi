/**
 * Read-only 1–5 star row (Material Symbols).
 * @param {{ value: number }} props — clamped 0–5
 */
export default function StarRating({ value }) {
  const v = Math.min(5, Math.max(0, Math.round(Number(value) || 0)))
  return (
    <div className="flex gap-0.5 text-primary" aria-label={`${v} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="material-symbols-outlined text-[18px]"
          style={i <= v ? { fontVariationSettings: "'FILL' 1" } : undefined}
          aria-hidden
        >
          star
        </span>
      ))}
    </div>
  )
}
