import { supabase } from './supabaseClient'
import { monthRange } from './dateUtils'
import { buildDailySeries, bookingSourceBreakdown } from './analytics'

const BOOKING_SELECT = 'id, guest_name, check_in_date, check_out_date, status, source, total_amount, amount_paid, payment_method, room:rooms(room_number, room_type)'

export async function fetchMonthlyReportData(hotelId, year, month) {
  const { start, end } = monthRange(year, month)

  const [{ data: bookings }, { data: tickets }, { data: handovers }, { data: corporateClients }, { data: rooms }, { data: hotel }] =
    await Promise.all([
      supabase
        .from('bookings')
        .select(BOOKING_SELECT)
        .eq('hotel_id', hotelId)
        .lte('check_in_date', end)
        .gte('check_out_date', start)
        .neq('status', 'cancelled'),
      supabase
        .from('maintenance_tickets')
        .select('id, description, status, created_at, resolved_at, room:rooms(room_number)')
        .eq('hotel_id', hotelId)
        .gte('created_at', `${start}T00:00:00`)
        .lte('created_at', `${end}T23:59:59`),
      supabase
        .from('shift_handovers')
        .select('id, shift_date, cash_collected, cash_expected, notes, staff:staff(name)')
        .eq('hotel_id', hotelId)
        .gte('shift_date', start)
        .lte('shift_date', end),
      supabase
        .from('corporate_clients')
        .select('id, company_name, purpose, event_date, total_amount, deposit_amount, amount_paid, status')
        .eq('hotel_id', hotelId)
        .gte('event_date', start)
        .lte('event_date', end),
      supabase.from('rooms').select('id').eq('hotel_id', hotelId),
      supabase.from('hotels').select('name').eq('id', hotelId).single(),
    ])

  return {
    start,
    end,
    bookings: bookings ?? [],
    tickets: tickets ?? [],
    handovers: handovers ?? [],
    corporateClients: corporateClients ?? [],
    totalRooms: rooms?.length ?? 0,
    hotelName: hotel?.name ?? 'Hotel',
  }
}

export function buildMonthlySummary(data) {
  const { start, end, bookings, tickets, handovers, corporateClients, totalRooms } = data

  const daily = buildDailySeries(bookings, totalRooms, start, end)
  const sourceBreakdown = bookingSourceBreakdown(bookings).filter((s) => s.revenue > 0 || s.count > 0)

  const totalRevenue = daily.reduce((sum, d) => sum + d.revenue, 0)
  const avgOccupancy = daily.length > 0 ? Math.round(daily.reduce((sum, d) => sum + d.occupancyPct, 0) / daily.length) : 0
  const roomNightsSold = daily.reduce((sum, d) => sum + d.occupiedRooms, 0)
  const adr = roomNightsSold > 0 ? totalRevenue / roomNightsSold : 0
  const availableRoomNights = totalRooms * daily.length
  const revpar = availableRoomNights > 0 ? totalRevenue / availableRoomNights : 0

  const revenueByMethod = daily.reduce((acc, d) => {
    for (const [method, amount] of Object.entries(d.revenueByMethod)) {
      acc[method] = (acc[method] ?? 0) + amount
    }
    return acc
  }, {})

  const ticketsOpened = tickets.length
  const ticketsResolved = tickets.filter((t) => t.status === 'resolved').length
  const ticketsStillOpen = tickets.filter((t) => t.status !== 'resolved').length

  const handoverMismatches = handovers.filter(
    (h) => Math.abs(Number(h.cash_collected) - Number(h.cash_expected)) > 0.009,
  )
  const totalMismatchAmount = handoverMismatches.reduce(
    (sum, h) => sum + (Number(h.cash_collected) - Number(h.cash_expected)),
    0,
  )

  const corporateRevenue = corporateClients.reduce((sum, c) => sum + Number(c.total_amount), 0)
  const corporateOutstanding = corporateClients.reduce(
    (sum, c) => sum + (c.status === 'cancelled' ? 0 : Number(c.total_amount) - Number(c.amount_paid)),
    0,
  )

  return {
    hotelName: data.hotelName,
    start,
    end,
    bookings,
    daily,
    sourceBreakdown,
    totalRevenue,
    avgOccupancy,
    roomNightsSold,
    adr,
    revpar,
    revenueByMethod,
    tickets,
    ticketsOpened,
    ticketsResolved,
    ticketsStillOpen,
    handovers,
    handoverMismatches,
    totalMismatchAmount,
    corporateClients,
    corporateRevenue,
    corporateOutstanding,
  }
}
