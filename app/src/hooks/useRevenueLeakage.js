import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { addDays, toISODate } from '../lib/dateUtils'

// Flags bookings whose check-in was 3+ days ago but still carry an
// outstanding balance. PostgREST can't compare two columns in a filter, so
// the total_amount > amount_paid check happens client-side after narrowing
// by date — fine at hotel-operational data volumes.
export function useRevenueLeakage(hotelId) {
  const [outstanding, setOutstanding] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hotelId) return
    const cutoff = toISODate(addDays(new Date(), -3))
    supabase
      .from('bookings')
      .select('id, guest_name, guest_phone, check_in_date, total_amount, amount_paid, room:rooms(room_number)')
      .eq('hotel_id', hotelId)
      .lte('check_in_date', cutoff)
      .neq('status', 'cancelled')
      .then(({ data }) => {
        const flagged = (data ?? [])
          .filter((b) => Number(b.total_amount) > Number(b.amount_paid))
          .map((b) => ({ ...b, balance: Number(b.total_amount) - Number(b.amount_paid) }))
          .sort((a, b) => b.balance - a.balance)
        setOutstanding(flagged)
        setLoading(false)
      })
  }, [hotelId])

  const totalOutstanding = outstanding.reduce((sum, b) => sum + b.balance, 0)
  return { outstanding, totalOutstanding, loading }
}
