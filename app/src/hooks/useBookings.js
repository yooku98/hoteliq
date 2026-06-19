import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const BOOKING_WITH_ROOM = 'id, guest_name, guest_phone, check_in_date, check_out_date, status, source, total_amount, amount_paid, payment_method, created_at, room:rooms(id, room_number, room_type)'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function useTodayBookings(hotelId) {
  const [arrivals, setArrivals] = useState([])
  const [departures, setDepartures] = useState([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!hotelId) return
    const today = todayISO()
    const [{ data: arr }, { data: dep }] = await Promise.all([
      supabase
        .from('bookings')
        .select(BOOKING_WITH_ROOM)
        .eq('hotel_id', hotelId)
        .eq('check_in_date', today)
        .neq('status', 'cancelled')
        .order('room_id'),
      supabase
        .from('bookings')
        .select(BOOKING_WITH_ROOM)
        .eq('hotel_id', hotelId)
        .eq('check_out_date', today)
        .neq('status', 'cancelled')
        .order('room_id'),
    ])
    setArrivals(arr ?? [])
    setDepartures(dep ?? [])
  }, [hotelId])

  useEffect(() => {
    if (!hotelId) return
    refetch().then(() => setLoading(false))

    const channel = supabase
      .channel(`bookings-today-${hotelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `hotel_id=eq.${hotelId}` },
        refetch,
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [hotelId, refetch])

  return { arrivals, departures, loading, refetch }
}

export function useBookingsInRange(hotelId, startDate, endDate) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!hotelId) return
    const { data } = await supabase
      .from('bookings')
      .select(BOOKING_WITH_ROOM)
      .eq('hotel_id', hotelId)
      .lte('check_in_date', endDate)
      .gte('check_out_date', startDate)
      .neq('status', 'cancelled')
    setBookings(data ?? [])
  }, [hotelId, startDate, endDate])

  useEffect(() => {
    if (!hotelId) return
    refetch().then(() => setLoading(false))
  }, [hotelId, refetch])

  return { bookings, loading, refetch }
}

export async function createBooking(hotelId, payload) {
  return supabase.from('bookings').insert({ hotel_id: hotelId, ...payload })
}
