import { useEffect } from 'react'
import { useOwnerBriefing } from '../../hooks/useOwnerBriefing'

export default function WeeklyBriefing({ hotelId }) {
  const { briefing, loading, error, generate } = useOwnerBriefing(hotelId)

  useEffect(() => {
    generate()
  }, [generate])

  return (
    <div
      className="rounded-xl p-5 text-white"
      style={{ background: 'linear-gradient(135deg, #0D1F1F 0%, #0E2D2D 100%)' }}
    >
      <div className="flex items-center gap-2.5 mb-3.5">
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
          ✦
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
            HotelIQ AI · Weekly briefing
          </div>
          <div className="text-[12px] text-white/80 mt-0.5">
            {briefing
              ? `Generated ${new Date(briefing.generated_at).toLocaleString()}`
              : "Crunching this week's booking & operations data…"}
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="ml-auto text-[11px] text-white/60 hover:text-white disabled:opacity-40 flex-shrink-0"
        >
          {loading ? 'Generating…' : 'Refresh'}
        </button>
      </div>

      {error && <p className="text-[12px] text-coral-light">{error}</p>}

      {briefing && (
        <>
          <p className="text-[13px] text-white/90 leading-relaxed mb-3.5">{briefing.narrative}</p>
          {briefing.anomalies.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5">
              {briefing.anomalies.map((a, i) => (
                <div key={i} className="bg-white/[0.07] border border-white/10 rounded-lg px-3.5 py-3">
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
