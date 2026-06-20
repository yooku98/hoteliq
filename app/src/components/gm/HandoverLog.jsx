import { Badge } from '../ui/Panel'
import { ExpandablePanel } from '../ui/ExpandablePanel'

function money(n) {
  return `GH₵ ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function HandoverLog({ handovers }) {
  const mismatches = handovers.filter((h) => Math.abs(Number(h.cash_collected) - Number(h.cash_expected)) > 0.009)

  return (
    <ExpandablePanel
      title="Shift handover log"
      badge={mismatches.length > 0 ? <Badge tone="coral">{mismatches.length} mismatch</Badge> : <Badge tone="green">Balanced</Badge>}
    >
      {(expanded) => {
        const visible = expanded ? handovers : handovers.slice(0, 8)
        return handovers.length === 0 ? (
          <div className="text-ink3 text-[12px] py-4 text-center">No handovers logged yet.</div>
        ) : (
          <div className="flex flex-col">
            {visible.map((h) => {
              const diff = Number(h.cash_collected) - Number(h.cash_expected)
              const mismatch = Math.abs(diff) > 0.009
              return (
                <div
                  key={h.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-none text-[12px]"
                >
                  <div>
                    <div className="font-medium text-ink">{h.shift_date}</div>
                    <div className="text-ink3 text-[11px]">{h.staff?.name ?? 'Front desk'}</div>
                    {expanded && h.notes && <div className="text-ink3 text-[11px] mt-0.5">{h.notes}</div>}
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
        )
      }}
    </ExpandablePanel>
  )
}
