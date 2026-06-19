import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useOwnerBriefing(hotelId) {
  const [briefing, setBriefing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generate = useCallback(async () => {
    if (!hotelId) return
    setLoading(true)
    setError(null)
    const { data, error: invokeError } = await supabase.functions.invoke('generate_owner_briefing', {
      body: { hotel_id: hotelId },
    })
    setLoading(false)
    if (invokeError) {
      setError(invokeError.message)
      return
    }
    setBriefing(data)
  }, [hotelId])

  return { briefing, loading, error, generate }
}
