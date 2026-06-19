import { useState } from 'react'

const STATUSES = ['clean', 'dirty', 'occupied', 'maintenance', 'blocked']

export default function RoomDetailModal({ room, onClose, onUpdateStatus, onCreateTicket }) {
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleReportIssue(e) {
    e.preventDefault()
    if (!description.trim()) return
    setSubmitting(true)
    await onCreateTicket(description.trim())
    setSubmitting(false)
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200] px-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl border border-border p-5 w-full max-w-[360px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-[15px] font-semibold text-ink">Room {room.room_number}</div>
            <div className="text-[12px] text-ink3">{room.room_type}</div>
          </div>
          <button onClick={onClose} className="text-ink3 text-[11px] hover:text-ink">
            Close
          </button>
        </div>

        <div className="mb-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-ink3 mb-2">
            Set status
          </div>
          <div className="grid grid-cols-3 gap-2">
            {STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => onUpdateStatus(status)}
                className={`text-[11px] font-medium rounded-lg py-2 border transition-colors ${
                  room.status === status
                    ? 'bg-ink text-white border-ink'
                    : 'border-border text-ink2 hover:border-ink'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleReportIssue}>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-ink3 mb-2">
            Report a maintenance issue
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. AC unit not cooling"
            rows={2}
            className="w-full border border-border rounded-lg px-3 py-2 text-[13px] text-ink resize-none focus:outline-none focus:border-teal"
          />
          <button
            type="submit"
            disabled={submitting || !description.trim()}
            className="w-full mt-2 bg-coral text-white text-[12px] font-medium rounded-lg py-2 disabled:opacity-40"
          >
            {submitting ? 'Submitting…' : 'Create ticket'}
          </button>
        </form>
      </div>
    </div>
  )
}
