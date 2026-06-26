import { useState } from 'react'
import { Panel } from '../ui/Panel'
import RoomDetailModal from './RoomDetailModal'

const STATUS_STYLES = {
  clean: 'bg-green-light text-green border-green/20',
  dirty: 'bg-gold-light text-gold border-gold/20',
  occupied: 'bg-teal-light text-teal border-teal/20',
  maintenance: 'bg-coral-light text-coral border-coral/20',
  blocked: 'bg-purple-light text-purple border-purple/20',
}

const STATUS_LABEL = {
  clean: 'Clean',
  dirty: 'Dirty',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
  blocked: 'Blocked',
}

export default function RoomGrid({ rooms, loading, onUpdateStatus, onCreateTicket }) {
  const [selectedRoom, setSelectedRoom] = useState(null)

  const counts = rooms.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <Panel
      title="Room status"
      badge={
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(STATUS_LABEL).map(([key, label]) => (
            <span key={key} className="text-[10px] text-ink3">
              {label} {counts[key] ?? 0}
            </span>
          ))}
        </div>
      }
    >
      {loading ? (
        <div className="text-ink3 text-sm py-6 text-center">Loading rooms…</div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`border rounded-lg px-2 py-2.5 text-center transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${STATUS_STYLES[room.status]}`}
            >
              <div className="text-[13px] font-semibold leading-none">{room.room_number}</div>
              <div className="text-[9px] uppercase tracking-wide mt-1 opacity-80">
                {room.room_type}
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedRoom && (
        <RoomDetailModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onUpdateStatus={async (status) => {
            await onUpdateStatus(selectedRoom.id, status)
            setSelectedRoom(null)
          }}
          onCreateTicket={async (description) => {
            await onCreateTicket(selectedRoom.id, description)
            setSelectedRoom(null)
          }}
        />
      )}
    </Panel>
  )
}
