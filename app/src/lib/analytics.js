import { dateRange } from './dateUtils'

const PAYMENT_METHODS = ['cash', 'momo_mtn', 'momo_vodafone', 'momo_airteltigo', 'card']
const BOOKING_SOURCES = ['walk_in', 'phone', 'booking_com', 'expedia', 'direct']

// Revenue is attributed to a booking's check-in date — a deliberate
// simplification since there's no separate payments ledger in v1.
export function buildDailySeries(bookings, totalRooms, startDate, endDate) {
  const days = dateRange(startDate, endDate)
  const byDate = new Map(days.map((d) => [d, { date: d, occupiedRooms: 0, revenue: 0, revenueByMethod: Object.fromEntries(PAYMENT_METHODS.map((m) => [m, 0])) }]))

  for (const booking of bookings) {
    for (const day of days) {
      if (booking.check_in_date <= day && day < booking.check_out_date) {
        byDate.get(day).occupiedRooms += 1
      }
    }
    if (byDate.has(booking.check_in_date)) {
      const entry = byDate.get(booking.check_in_date)
      entry.revenue += Number(booking.total_amount)
      if (booking.payment_method) {
        entry.revenueByMethod[booking.payment_method] += Number(booking.total_amount)
      }
    }
  }

  return days.map((d) => {
    const entry = byDate.get(d)
    return {
      ...entry,
      occupancyPct: totalRooms > 0 ? Math.round((entry.occupiedRooms / totalRooms) * 100) : 0,
    }
  })
}

export function bookingSourceBreakdown(bookings) {
  const totals = Object.fromEntries(BOOKING_SOURCES.map((s) => [s, { count: 0, revenue: 0 }]))
  for (const booking of bookings) {
    if (!totals[booking.source]) continue
    totals[booking.source].count += 1
    totals[booking.source].revenue += Number(booking.total_amount)
  }
  const totalRevenue = Object.values(totals).reduce((sum, t) => sum + t.revenue, 0)
  return BOOKING_SOURCES.map((source) => ({
    source,
    ...totals[source],
    pct: totalRevenue > 0 ? Math.round((totals[source].revenue / totalRevenue) * 100) : 0,
  }))
}
