import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const CLIENT_SELECT = 'id, company_name, contact_name, contact_phone, contact_email, purpose, event_date, total_amount, deposit_amount, amount_paid, status, notes, created_at'

export function useCorporateClients(hotelId) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!hotelId) return
    const { data } = await supabase
      .from('corporate_clients')
      .select(CLIENT_SELECT)
      .eq('hotel_id', hotelId)
      .order('event_date', { ascending: true, nullsFirst: false })
    setClients(data ?? [])
  }, [hotelId])

  useEffect(() => {
    if (!hotelId) return
    refetch().then(() => setLoading(false))
  }, [hotelId, refetch])

  async function createClient(payload, loggedBy) {
    const { error } = await supabase
      .from('corporate_clients')
      .insert({ hotel_id: hotelId, logged_by: loggedBy, ...payload })
    if (!error) await refetch()
    return { error }
  }

  async function recordPayment(clientId, currentAmountPaid, amount) {
    const { error } = await supabase
      .from('corporate_clients')
      .update({ amount_paid: Number(currentAmountPaid) + Number(amount) })
      .eq('id', clientId)
    if (!error) await refetch()
    return { error }
  }

  async function updateStatus(clientId, status) {
    const { error } = await supabase.from('corporate_clients').update({ status }).eq('id', clientId)
    if (!error) await refetch()
    return { error }
  }

  return { clients, loading, refetch, createClient, recordPayment, updateStatus }
}
