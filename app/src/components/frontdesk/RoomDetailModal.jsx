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
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200] px-4 animate-overlay-in"
      onClick={onClose}
    >
      <div
        className="glass-light rounded-2xl p-5 w-full max-w-[360px] max-h-[90vh] overflow-y-auto animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-[15px] font-semibold text-ink">Room {room.room_number}</div>
            <div className="text-[12px] text-ink3">{room.room_type}</div>
          </div>
          <button onClick={onClose} className="text-ink3 text-[11px] hover:text-ink transition-colors duration-150">
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
                className={`text-[11px] font-medium rounded-lg py-2 border transition-all duration-150 ${
                  room.status === status
                    ? 'bg-ink text-white border-ink shadow-md'
                    : 'border-border text-ink2 hover:border-ink hover:-translate-y-0.5'
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
            className="input resize-none"
          />
          <button
            type="submit"
            disabled={submitting || !description.trim()}
            className="w-full mt-2 bg-coral text-white text-[12px] font-medium rounded-lg py-2 transition-all duration-150 hover:shadow-md disabled:opacity-40"
          >
            {submitting ? 'Submitting…' : 'Create ticket'}
          </button>
        </form>
      </div>
    </div>
  )
}
