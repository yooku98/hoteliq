import { useState } from 'react'
import { Panel, Badge } from '../ui/Panel'
import { useTodayCashSummary } from '../../hooks/useTodayCashSummary'

function money(n) {
  return `GH₵ ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function ReconciliationWidget({ hotelId, staffId, handovers, onCreate }) {
  const { expected, loading: expectedLoading } = useTodayCashSummary(hotelId)
  const [collected, setCollected] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const recent = handovers.slice(0, 5)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    await onCreate(staffId, {
      shift_date: new Date().toISOString().slice(0, 10),
      cash_expected: expected,
      cash_collected: Number(collected) || 0,
      notes: notes.trim() || null,
    })
    setSubmitting(false)
    setCollected('')
    setNotes('')
  }

  return (
    <Panel title="Shift reconciliation" badge={<Badge tone="gold">Cash &amp; MoMo</Badge>}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-surface rounded-lg px-3 py-2.5">
          <div className="text-[10px] text-ink3 mb-1">Expected (from today's bookings)</div>
          <div className="text-[16px] font-semibold text-ink">
            {expectedLoading ? '…' : money(expected)}
          </div>
        </div>
        <div className="bg-surface rounded-lg px-3 py-2.5">
          <div className="text-[10px] text-ink3 mb-1">Counted &amp; collected</div>
          <input
            type="number"
            min="0"
            step="0.01"
            value={collected}
            onChange={(e) => setCollected(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent text-[16px] font-semibold text-ink focus:outline-none"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes on any discrepancy…"
          rows={2}
          className="input resize-none"
        />
        <button
          type="submit"
          disabled={submitting || collected === ''}
          className="bg-ink text-white text-[12px] font-medium rounded-lg py-2 transition-all duration-150 hover:shadow-md active:scale-[0.99] disabled:opacity-40"
        >
          {submitting ? 'Logging…' : 'Log end-of-shift handover'}
        </button>
      </form>

      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink3 mb-2">
        Recent handovers
      </div>
      <div className="flex flex-col">
        {recent.length === 0 && <div className="text-ink3 text-[12px] py-2">None logged yet.</div>}
        {recent.map((h) => {
          const diff = Number(h.cash_collected) - Number(h.cash_expected)
          const mismatch = Math.abs(diff) > 0.009
          return (
            <div
              key={h.id}
              className="flex items-center justify-between py-2 border-b border-border last:border-none text-[12px] transition-colors duration-150 hover:bg-surface/60 rounded-md -mx-1 px-1"
            >
              <div>
                <div className="font-medium text-ink">{h.shift_date}</div>
                <div className="text-ink3 text-[11px]">{h.staff?.name}</div>
              </div>
              <div className="text-right">
                <div className={mismatch ? 'text-coral font-semibold' : 'text-green font-semibold'}>
                  {mismatch ? `${diff > 0 ? '+' : ''}${money(diff)}` : 'Balanced'}
                </div>
                <div className="text-ink3 text-[11px]">
                  {money(h.cash_collected)} of {money(h.cash_expected)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
