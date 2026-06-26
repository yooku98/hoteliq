import { useState } from 'react'

export function Disclosure({ title, badge, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden transition-shadow duration-200 hover:shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors duration-150 hover:bg-surface/60"
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink3">
          {title}
        </span>
        <div className="flex items-center gap-2.5">
          {badge}
          <span className={`text-ink3 text-[10px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </div>
      </button>
      <div className={`collapse-grid ${open ? 'is-open' : ''}`}>
        <div className="px-5 pb-5 -mt-1">{children}</div>
      </div>
    </div>
  )
}
