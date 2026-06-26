import { useOwnerBriefing } from '../../hooks/useOwnerBriefing'

// AI integration (the generate_owner_briefing edge function) is paused for
// now, so this stays a styled placeholder rather than auto-firing a request
// that will fail — flip `AI_ENABLED` once the function is deployed.
const AI_ENABLED = false

export default function WeeklyBriefing({ hotelId }) {
  const { briefing, loading, error, generate } = useOwnerBriefing(hotelId)

  return (
    <div
      className="rounded-2xl p-5 sm:p-6 text-white backdrop-blur-xl border border-white/10 shadow-lg shadow-black/10"
      style={{ background: 'linear-gradient(135deg, rgba(13,31,31,0.92) 0%, rgba(14,45,45,0.92) 100%)' }}
    >
      <div className="flex items-center gap-2.5 mb-3.5 flex-wrap">
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
          ✦
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
            HotelIQ AI · Weekly briefing
          </div>
          <div className="text-[12px] text-white/80 mt-0.5">
            {!AI_ENABLED
              ? 'Coming soon — AI briefing isn’t enabled for this property yet.'
              : briefing
                ? `Generated ${new Date(briefing.generated_at).toLocaleString()}`
                : "Crunching this week's booking & operations data…"}
          </div>
        </div>
        {AI_ENABLED && (
          <button
            onClick={generate}
            disabled={loading}
            className="ml-auto text-[11px] text-white/60 hover:text-white transition-colors duration-150 disabled:opacity-40 flex-shrink-0"
          >
            {loading ? 'Generating…' : 'Refresh'}
          </button>
        )}
      </div>

      {AI_ENABLED && error && <p className="text-[12px] text-coral-light">{error}</p>}

      {AI_ENABLED && briefing && (
        <>
          <p className="text-[13px] text-white/90 leading-relaxed mb-3.5">{briefing.narrative}</p>
          {briefing.anomalies.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {briefing.anomalies.map((a, i) => (
                <div
                  key={i}
                  className="bg-white/[0.07] backdrop-blur-sm border border-white/10 rounded-lg px-3.5 py-3 transition-colors duration-150 hover:bg-white/[0.1]"
                >
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-[#F5A623] mb-1">
                    {a.label}
                  </div>
                  <div className="text-[12px] text-white/85 leading-snug">{a.detail}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
