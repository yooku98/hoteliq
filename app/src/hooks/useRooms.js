import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useRooms(hotelId) {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!hotelId) return
    const { data } = await supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', hotelId)
      .order('room_number')
    setRooms(data ?? [])
  }, [hotelId])

  useEffect(() => {
    if (!hotelId) return
    refetch().then(() => setLoading(false))

    const channel = supabase
      .channel(`rooms-${hotelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `hotel_id=eq.${hotelId}` },
        refetch,
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [hotelId, refetch])

  async function updateRoomStatus(roomId, status) {
    const { error } = await supabase.from('rooms').update({ status }).eq('id', roomId)
    if (!error) await refetch()
    return { error }
  }

  return { rooms, loading, refetch, updateRoomStatus }
}
