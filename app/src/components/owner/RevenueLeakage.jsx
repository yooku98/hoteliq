import { Badge } from '../ui/Panel'
import { ExpandablePanel } from '../ui/ExpandablePanel'

function money(n) {
  return `GH₵ ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function daysAgo(dateStr) {
  const ms = Date.now() - new Date(dateStr).getTime()
  return Math.floor(ms / 86400000)
}

export default function RevenueLeakage({ outstanding, totalOutstanding, loading }) {
  return (
    <ExpandablePanel
      title="Revenue leakage — outstanding 3+ days"
      badge={<Badge tone="coral">{money(totalOutstanding)}</Badge>}
    >
      {(expanded) => {
        const visible = expanded ? outstanding : outstanding.slice(0, 8)
        return loading ? (
          <div className="text-ink3 text-sm py-6 text-center">Loading…</div>
        ) : outstanding.length === 0 ? (
          <div className="text-ink3 text-[12px] py-4 text-center">
            No aging balances — all stays are fully reconciled.
          </div>
        ) : (
          <div className="flex flex-col">
            {visible.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-none text-[12px] transition-colors duration-150 hover:bg-surface/40 rounded-md -mx-1 px-1"
              >
                <div>
                  <div className="font-medium text-ink">{b.guest_name}</div>
                  <div className="text-ink3 text-[11px]">
                    Room {b.room?.room_number} · checked in {daysAgo(b.check_in_date)}d ago
                    {expanded && b.guest_phone && ` · ${b.guest_phone}`}
                  </div>
                </div>
                <div className="text-coral font-semibold">{money(b.balance)}</div>
              </div>
            ))}
          </div>
        )
      }}
    </ExpandablePanel>
  )
}
