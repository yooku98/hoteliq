import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const HANDOVER_SELECT = 'id, shift_date, cash_collected, cash_expected, notes, created_at, staff:staff(name)'

// RLS scopes this automatically: front_desk sees only their own handovers,
// general_manager/owner see every handover for the hotel.
export function useShiftHandovers(hotelId) {
  const [handovers, setHandovers] = useState([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!hotelId) return
    const { data } = await supabase
      .from('shift_handovers')
      .select(HANDOVER_SELECT)
      .eq('hotel_id', hotelId)
      .order('shift_date', { ascending: false })
      .limit(30)
    setHandovers(data ?? [])
  }, [hotelId])

  useEffect(() => {
    if (!hotelId) return
    refetch().then(() => setLoading(false))
  }, [hotelId, refetch])

  async function createHandover(staffId, payload) {
    const { error } = await supabase
      .from('shift_handovers')
      .insert({ hotel_id: hotelId, staff_id: staffId, ...payload })
    if (!error) await refetch()
    return { error }
  }

  return { handovers, loading, refetch, createHandover }
}
