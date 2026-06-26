import { useMemo } from 'react'
import { useBookingsInRange } from './useBookings'
import { buildMonthlySeries } from '../lib/analytics'
import { addMonths, startOfMonth, toISODate, todayISO } from '../lib/dateUtils'

// Only fetches once `enabled` (toggled to the monthly view) — passing a null
// hotelId keeps useBookingsInRange from querying until then.
export function useMonthlyOccupancy(hotelId, totalRooms, monthsBack = 6, enabled = true) {
  const start = toISODate(startOfMonth(addMonths(new Date(), -(monthsBack - 1))))
  const end = todayISO()
  const { bookings, loading } = useBookingsInRange(enabled ? hotelId : null, start, end)

  const series = useMemo(
    () => buildMonthlySeries(bookings, totalRooms, start, end),
    [bookings, totalRooms, start, end],
  )

  return { series, loading: enabled ? loading : false }
}
