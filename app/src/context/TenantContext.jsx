import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'

const ACTIVE_HOTEL_KEY = 'hoteliq_active_hotel_id'

const TenantContext = createContext(null)

// One row per (hotel, person) in `staff` — a person owning several hotels
// has several memberships. This provider tracks which membership/hotel is
// "active" right now, the way InsureTrack's tenant context tracks the
// active org for multi-org brokers.
export function TenantProvider({ children }) {
  const { user } = useAuth()
  const [memberships, setMemberships] = useState([])
  const [activeHotelId, setActiveHotelId] = useState(() => localStorage.getItem(ACTIVE_HOTEL_KEY))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setMemberships([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    supabase
      .from('staff')
      .select('id, hotel_id, role, name, email, hotel:hotels(*)')
      .eq('auth_user_id', user.id)
      .then(({ data, error: fetchError }) => {
        if (cancelled) return
        if (fetchError) {
          setError(fetchError)
        } else {
          setMemberships(data ?? [])
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  const activeMembership = useMemo(() => {
    if (memberships.length === 0) return null
    return memberships.find((m) => m.hotel_id === activeHotelId) ?? memberships[0]
  }, [memberships, activeHotelId])

  function switchHotel(hotelId) {
    localStorage.setItem(ACTIVE_HOTEL_KEY, hotelId)
    setActiveHotelId(hotelId)
  }

  const value = {
    loading,
    error,
    memberships,
    hotels: memberships.map((m) => m.hotel),
    activeMembership,
    hotel: activeMembership?.hotel ?? null,
    role: activeMembership?.role ?? null,
    staffId: activeMembership?.id ?? null,
    hasMultipleHotels: memberships.length > 1,
    switchHotel,
  }

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used within TenantProvider')
  return ctx
}
