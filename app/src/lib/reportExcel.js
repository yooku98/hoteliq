// Uses only XLSX's write path (json_to_sheet / writeFile) to generate a
// workbook — never XLSX.read/parse. The published `xlsx` package has known
// CVEs in its *parsing* code (prototype pollution, ReDoS on crafted input
// files); since we never parse untrusted spreadsheets, that surface isn't
// exercised here.
import * as XLSX from 'xlsx'

function round2(n) {
  return Math.round(Number(n) * 100) / 100
}

export function generateMonthlyReportExcel(summary) {
  const wb = XLSX.utils.book_new()

  const summaryRows = [
    { Metric: 'Average occupancy %', Value: summary.avgOccupancy },
    { Metric: 'Total revenue (GH₵)', Value: round2(summary.totalRevenue) },
    { Metric: 'ADR (GH₵)', Value: round2(summary.adr) },
    { Metric: 'RevPAR (GH₵)', Value: round2(summary.revpar) },
    { Metric: 'Room-nights sold', Value: summary.roomNightsSold },
    { Metric: 'Maintenance tickets opened', Value: summary.ticketsOpened },
    { Metric: 'Maintenance tickets resolved', Value: summary.ticketsResolved },
    { Metric: 'Maintenance tickets still open', Value: summary.ticketsStillOpen },
    { Metric: 'Shift handovers logged', Value: summary.handovers.length },
    { Metric: 'Shift handovers with a mismatch', Value: summary.handoverMismatches.length },
    { Metric: 'Net cash mismatch (GH₵)', Value: round2(summary.totalMismatchAmount) },
    { Metric: 'Corporate/group deal value (GH₵)', Value: round2(summary.corporateRevenue) },
    { Metric: 'Corporate/group outstanding (GH₵)', Value: round2(summary.corporateOutstanding) },
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), 'Summary')

  const dailyRows = summary.daily.map((d) => ({
    Date: d.date,
    'Occupancy %': d.occupancyPct,
    'Occupied rooms': d.occupiedRooms,
    'Revenue (GH₵)': round2(d.revenue),
    'Cash (GH₵)': round2(d.revenueByMethod.cash),
    'MoMo MTN (GH₵)': round2(d.revenueByMethod.momo_mtn),
    'MoMo Vodafone (GH₵)': round2(d.revenueByMethod.momo_vodafone),
    'MoMo AirtelTigo (GH₵)': round2(d.revenueByMethod.momo_airteltigo),
    'Card (GH₵)': round2(d.revenueByMethod.card),
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dailyRows), 'Daily')

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      summary.bookings.map((b) => ({
        Guest: b.guest_name,
        Room: b.room?.room_number ?? '',
        'Room type': b.room?.room_type ?? '',
        'Check-in': b.check_in_date,
        'Check-out': b.check_out_date,
        Status: b.status,
        Source: b.source,
        'Total (GH₵)': round2(b.total_amount),
        'Paid (GH₵)': round2(b.amount_paid),
        'Payment method': b.payment_method ?? '',
      })),
    ),
    'Bookings',
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      summary.corporateClients.map((c) => ({
        Company: c.company_name,
        Purpose: c.purpose ?? '',
        Status: c.status,
        'Event date': c.event_date,
        'Total (GH₵)': round2(c.total_amount),
        'Deposit (GH₵)': round2(c.deposit_amount),
        'Paid (GH₵)': round2(c.amount_paid),
        'Balance (GH₵)': round2(Number(c.total_amount) - Number(c.amount_paid)),
      })),
    ),
    'Corporate clients',
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      summary.tickets.map((t) => ({
        Room: t.room?.room_number ?? '',
        Description: t.description,
        Status: t.status,
        'Created at': t.created_at,
        'Resolved at': t.resolved_at ?? '',
      })),
    ),
    'Maintenance',
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      summary.handovers.map((h) => ({
        Date: h.shift_date,
        Staff: h.staff?.name ?? '',
        'Cash collected (GH₵)': round2(h.cash_collected),
        'Cash expected (GH₵)': round2(h.cash_expected),
        'Mismatch (GH₵)': round2(Number(h.cash_collected) - Number(h.cash_expected)),
        Notes: h.notes ?? '',
      })),
    ),
    'Handovers',
  )

  const filenameMonth = new Date(summary.start).toISOString().slice(0, 7)
  XLSX.writeFile(wb, `${summary.hotelName.replace(/[^a-z0-9]+/gi, '-')}-report-${filenameMonth}.xlsx`)
}
