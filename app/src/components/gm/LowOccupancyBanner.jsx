const DEFAULT_THRESHOLD = 40

function formatDay(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function LowOccupancyBanner({ series, threshold = DEFAULT_THRESHOLD }) {
  const lowDays = series.filter((d) => d.occupancyPct < threshold)
  if (lowDays.length === 0) return null

  const avg = Math.round(lowDays.reduce((sum, d) => sum + d.occupancyPct, 0) / lowDays.length)

  return (
    <div className="bg-coral-light border border-coral/20 rounded-xl px-5 py-3.5 flex items-start gap-3">
      <span className="text-coral text-base leading-none mt-0.5">⚠</span>
      <div className="text-[12.5px] text-ink2 leading-relaxed">
        <span className="font-semibold text-coral">
          {lowDays.length} of the next 7 days are projected below {threshold}% occupancy
        </span>{' '}
        (avg {avg}%): {lowDays.map(formatDay).join(', ')}. Consider a short-stay promotion or a
        rate adjustment for these dates to lift demand.
      </div>
    </div>
  )
}
