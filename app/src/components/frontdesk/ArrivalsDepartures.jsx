import { Panel, Badge } from '../ui/Panel'

function GuestRow({ booking }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-none text-[12px]">
      <div>
        <div className="font-medium text-ink">{booking.guest_name}</div>
        <div className="text-ink3 text-[11px]">
          Room {booking.room?.room_number} · {booking.room?.room_type}
        </div>
      </div>
      <span className="text-ink3 text-[11px] capitalize">{booking.status.replace('_', ' ')}</span>
    </div>
  )
}

export default function ArrivalsDepartures({ arrivals, departures, loading }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Panel title="Today's arrivals" badge={<Badge tone="teal">{arrivals.length}</Badge>}>
        {loading ? (
          <div className="text-ink3 text-sm py-4 text-center">Loading…</div>
        ) : arrivals.length === 0 ? (
          <div className="text-ink3 text-[12px] py-4 text-center">No arrivals today</div>
        ) : (
          arrivals.map((b) => <GuestRow key={b.id} booking={b} />)
        )}
      </Panel>
      <Panel title="Today's departures" badge={<Badge tone="gold">{departures.length}</Badge>}>
        {loading ? (
          <div className="text-ink3 text-sm py-4 text-center">Loading…</div>
        ) : departures.length === 0 ? (
          <div className="text-ink3 text-[12px] py-4 text-center">No departures today</div>
        ) : (
          departures.map((b) => <GuestRow key={b.id} booking={b} />)
        )}
      </Panel>
    </div>
  )
}
