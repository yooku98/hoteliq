import { Panel, Badge } from '../ui/Panel'

function money(n) {
  return `GH₵ ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function daysAgo(dateStr) {
  const ms = Date.now() - new Date(dateStr).getTime()
  return Math.floor(ms / 86400000)
}

export default function RevenueLeakage({ outstanding, totalOutstanding, loading }) {
  return (
    <Panel
      title="Revenue leakage — outstanding 3+ days"
      badge={<Badge tone="coral">{money(totalOutstanding)}</Badge>}
    >
      {loading ? (
        <div className="text-ink3 text-sm py-6 text-center">Loading…</div>
      ) : outstanding.length === 0 ? (
        <div className="text-ink3 text-[12px] py-4 text-center">
          No aging balances — all stays are fully reconciled.
        </div>
      ) : (
        <div className="flex flex-col">
          {outstanding.slice(0, 8).map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between py-2 border-b border-border last:border-none text-[12px]"
            >
              <div>
                <div className="font-medium text-ink">{b.guest_name}</div>
                <div className="text-ink3 text-[11px]">
                  Room {b.room?.room_number} · checked in {daysAgo(b.check_in_date)}d ago
                </div>
              </div>
              <div className="text-coral font-semibold">{money(b.balance)}</div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}
