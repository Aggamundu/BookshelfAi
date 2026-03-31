/**
 * @param {{ onClick: () => void, disabled?: boolean }} props
 */
export default function GenerateRecommendationsCta({ onClick, disabled }) {
  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="group flex items-center gap-3 rounded-xl bg-primary px-8 py-4 text-on-primary shadow-md transition-all duration-150 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="font-headline text-lg font-medium">Generate Recommendations</span>
        <span className="material-symbols-outlined transition-transform group-hover:translate-x-1" aria-hidden>
          arrow_forward
        </span>
      </button>
    </div>
  )
}
