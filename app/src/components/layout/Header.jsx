import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTenant } from '../../context/TenantContext'

const ROLE_LABEL = {
  front_desk: 'Front Desk',
  general_manager: 'General Manager',
  owner: 'Owner / CEO',
}

export default function Header() {
  const { signOut } = useAuth()
  const { hotel, role, hotels, hasMultipleHotels, switchHotel, activeMembership } = useTenant()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  const timeLabel = now.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <header className="bg-ink text-white px-8 h-[60px] flex items-center justify-between sticky top-0 z-[100]">
      <div className="flex items-center gap-5">
        <div className="font-display text-[22px] tracking-tight">
          Hotel<span className="text-gold">IQ</span>
        </div>
        {hasMultipleHotels ? (
          <select
            value={activeMembership?.hotel_id ?? ''}
            onChange={(e) => switchHotel(e.target.value)}
            className="bg-transparent text-[12px] font-medium text-white/55 uppercase tracking-wider border border-white/15 rounded px-2 py-1"
          >
            {hotels.map((h) => (
              <option key={h.id} value={h.id} className="text-ink">
                {h.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-[12px] font-medium text-white/55 uppercase tracking-wider">
            {hotel?.name}
          </div>
        )}
      </div>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/70 tracking-wide">
          <span className="w-[7px] h-[7px] rounded-full bg-[#4CAF50] animate-pulse" /> Live data
        </div>
        <div className="text-[11px] text-white/45">{timeLabel}</div>
        <div className="text-[11px] text-white/70">{ROLE_LABEL[role] ?? role}</div>
        <button
          onClick={() => signOut()}
          className="text-[11px] font-medium text-white/55 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
