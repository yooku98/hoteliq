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
      className="text-ink3 hover:text-ink text-[13px] leading-none transition-colors duration-150"
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
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200] px-4 animate-overlay-in"
          onClick={() => setExpanded(false)}
        >
          <div
            className="glass-light rounded-2xl p-4 sm:p-6 w-full max-w-[920px] max-h-[85vh] overflow-y-auto animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink3 flex items-center gap-2.5">
                {title}
                {badge}
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="text-ink3 text-[11px] hover:text-ink transition-colors duration-150"
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
