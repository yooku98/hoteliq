import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const TICKET_SELECT = 'id, description, status, created_at, resolved_at, room:rooms(id, room_number), reported_by_staff:staff(name)'

export function useMaintenanceTickets(hotelId) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!hotelId) return
    const { data } = await supabase
      .from('maintenance_tickets')
      .select(TICKET_SELECT)
      .eq('hotel_id', hotelId)
      .order('created_at', { ascending: false })
    setTickets(data ?? [])
  }, [hotelId])

  useEffect(() => {
    if (!hotelId) return
    refetch().then(() => setLoading(false))

    const channel = supabase
      .channel(`tickets-${hotelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'maintenance_tickets', filter: `hotel_id=eq.${hotelId}` },
        refetch,
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [hotelId, refetch])

  async function createTicket(roomId, description, reportedBy) {
    const { error } = await supabase
      .from('maintenance_tickets')
      .insert({ hotel_id: hotelId, room_id: roomId, description, reported_by: reportedBy })
    if (!error) await refetch()
    return { error }
  }

  async function updateTicketStatus(ticketId, status) {
    const { error } = await supabase
      .from('maintenance_tickets')
      .update({ status, resolved_at: status === 'resolved' ? new Date().toISOString() : null })
      .eq('id', ticketId)
    if (!error) await refetch()
    return { error }
  }

  return { tickets, loading, refetch, createTicket, updateTicketStatus }
}
