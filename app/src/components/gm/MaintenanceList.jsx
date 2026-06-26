import { Badge } from '../ui/Panel'
import { ExpandablePanel } from '../ui/ExpandablePanel'

function ageLabel(createdAt) {
  const hours = Math.floor((Date.now() - new Date(createdAt).getTime()) / 36e5)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h old`
  return `${Math.floor(hours / 24)}d old`
}

export default function MaintenanceList({ tickets, onUpdateStatus }) {
  const open = tickets
    .filter((t) => t.status !== 'resolved')
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  const resolved = tickets
    .filter((t) => t.status === 'resolved')
    .sort((a, b) => new Date(b.resolved_at) - new Date(a.resolved_at))

  return (
    <ExpandablePanel title="Maintenance tickets" badge={<Badge tone="coral">{open.length} open</Badge>}>
      {(expanded) => {
        const list = expanded ? [...open, ...resolved] : open
        return list.length === 0 ? (
          <div className="text-ink3 text-[12px] py-4 text-center">No open tickets. Nice work.</div>
        ) : (
          <div className="flex flex-col">
            {list.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-none transition-colors duration-150 hover:bg-surface/40 rounded-md -mx-1 px-1"
              >
                <div className="min-w-0">
                  <div className="text-[12px] font-medium text-ink">
                    Room {t.room?.room_number} — {t.description}
                  </div>
                  <div className="text-[11px] text-ink3">
                    Reported by {t.reported_by_staff?.name ?? 'staff'} ·{' '}
                    {t.status === 'resolved' ? `resolved ${ageLabel(t.resolved_at)} ago` : ageLabel(t.created_at)}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      t.status === 'in_progress'
                        ? 'bg-gold-light text-gold'
                        : t.status === 'resolved'
                          ? 'bg-green-light text-green'
                          : 'bg-coral-light text-coral'
                    }`}
                  >
                    {t.status.replace('_', ' ')}
                  </span>
                  {t.status === 'open' && (
                    <button
                      onClick={() => onUpdateStatus(t.id, 'in_progress')}
                      className="text-[11px] text-teal font-medium transition-colors duration-150 hover:text-teal/70"
                    >
                      Start
                    </button>
                  )}
                  {t.status === 'in_progress' && (
                    <button
                      onClick={() => onUpdateStatus(t.id, 'resolved')}
                      className="text-[11px] text-green font-medium transition-colors duration-150 hover:text-green/70"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }}
    </ExpandablePanel>
  )
}
