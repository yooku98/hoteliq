export function Panel({ title, badge, action, children, className = '' }) {
  return (
    <div className={`bg-card border border-border rounded-xl p-5 ${className}`}>
      {(title || badge || action) && (
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink3 mb-4 flex justify-between items-center">
          <span>{title}</span>
          <div className="flex items-center gap-2">
            {badge}
            {action}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

const BADGE_STYLES = {
  gold: 'bg-gold-light text-gold',
  teal: 'bg-teal-light text-teal',
  coral: 'bg-coral-light text-coral',
  green: 'bg-green-light text-green',
}

export function Badge({ tone = 'teal', children }) {
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md tracking-wide ${BADGE_STYLES[tone]}`}
    >
      {children}
    </span>
  )
}
