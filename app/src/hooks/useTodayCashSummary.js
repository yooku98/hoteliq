import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const NON_CARD_METHODS = ['cash', 'momo_mtn', 'momo_vodafone', 'momo_airteltigo']

// Expected cash/MoMo on hand = amount_paid on bookings logged today via a
// non-card method. There's no separate payments ledger in v1, so "logged
// today" (created_at) is the best available proxy for "collected today".
export function useTodayCashSummary(hotelId) {
  const [expected, setExpected] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hotelId) return
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    supabase
      .from('bookings')
      .select('amount_paid, payment_method')
      .eq('hotel_id', hotelId)
      .in('payment_method', NON_CARD_METHODS)
      .gte('created_at', startOfDay.toISOString())
      .then(({ data }) => {
        const total = (data ?? []).reduce((sum, b) => sum + Number(b.amount_paid), 0)
        setExpected(total)
        setLoading(false)
      })
  }, [hotelId])

  return { expected, loading }
}
