import { useMemo } from 'react'
import { useBookingsInRange } from './useBookings'
import { buildDailySeries } from '../lib/analytics'
import { addDays, toISODate } from '../lib/dateUtils'

export function useOccupancyRevenue(hotelId, totalRooms, { daysBack = 0, daysForward = 0 } = {}) {
  const start = toISODate(addDays(new Date(), -daysBack))
  const end = toISODate(addDays(new Date(), daysForward))
  const { bookings, loading } = useBookingsInRange(hotelId, start, end)

  const series = useMemo(
    () => buildDailySeries(bookings, totalRooms, start, end),
    [bookings, totalRooms, start, end],
  )

  return { series, bookings, loading }
}
