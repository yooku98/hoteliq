import { useState } from 'react'
import { Panel } from './Panel'

// Wraps Panel with a click-to-enlarge affordance. `children` is a render
// function `(expanded) => node` so charts/lists can show more detail (full
// height, no slicing) inside the enlarged modal without duplicating markup.
export function ExpandablePanel({ title, badge, children, className = '' }) {
  const [expanded, setExpanded] = useState(false)

  const expandButton = (
    <button
      onClick={() => setExpanded(true)}
      title="Expand"
      className="text-ink3 hover:text-ink text-[13px] leading-none"
    >
      ⤢
    </button>
  )

  return (
    <>
      <Panel title={title} badge={badge} action={expandButton} className={className}>
        {children(false)}
      </Panel>

      {expanded && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200] px-4"
          onClick={() => setExpanded(false)}
        >
          <div
            className="bg-card rounded-xl border border-border p-6 w-full max-w-[920px] max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink3 flex items-center gap-2.5">
                {title}
                {badge}
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="text-ink3 text-[11px] hover:text-ink"
              >
                Close
              </button>
            </div>
            {children(true)}
          </div>
        </div>
      )}
    </>
  )
}
