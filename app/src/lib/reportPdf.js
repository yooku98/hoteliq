import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const TEAL = [14, 107, 107]
const INK = [13, 13, 13]
const INK3 = [122, 122, 122]

function money(n) {
  return `GH₵ ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const METHOD_LABEL = {
  cash: 'Cash',
  momo_mtn: 'MoMo MTN',
  momo_vodafone: 'MoMo Vodafone',
  momo_airteltigo: 'MoMo AirtelTigo',
  card: 'Card',
}

const SOURCE_LABEL = {
  direct: 'Direct / website',
  booking_com: 'Booking.com',
  phone: 'Phone',
  expedia: 'Expedia / OTA',
  walk_in: 'Walk-in',
  corporate: 'Corporate / group',
}

function monthLabel(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export function generateMonthlyReportPdf(summary) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 40
  let y = 50

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...INK)
  doc.text(summary.hotelName, margin, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(...TEAL)
  y += 20
  doc.text(`Monthly performance report — ${monthLabel(summary.start)}`, margin, y)

  doc.setFontSize(9)
  doc.setTextColor(...INK3)
  y += 14
  doc.text(`Generated ${new Date().toLocaleString('en-GB')}`, margin, y)

  y += 24
  const kpis = [
    ['Average occupancy', `${summary.avgOccupancy}%`],
    ['Total revenue', money(summary.totalRevenue)],
    ['ADR', money(summary.adr)],
    ['RevPAR', money(summary.revpar)],
    ['Room-nights sold', String(summary.roomNightsSold)],
  ]
  const kpiWidth = (pageWidth - margin * 2) / kpis.length
  kpis.forEach(([label, value], i) => {
    const x = margin + i * kpiWidth
    doc.setFontSize(8)
    doc.setTextColor(...INK3)
    doc.text(label.toUpperCase(), x, y)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...INK)
    doc.text(value, x, y + 16)
    doc.setFont('helvetica', 'normal')
  })

  y += 36
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Payment method', 'Revenue']],
    body: Object.entries(summary.revenueByMethod)
      .filter(([, amount]) => amount > 0)
      .map(([method, amount]) => [METHOD_LABEL[method] ?? method, money(amount)]),
    headStyles: { fillColor: TEAL, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    styles: { cellPadding: 5 },
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 18,
    margin: { left: margin, right: margin },
    head: [['Booking source', 'Bookings', 'Revenue', 'Share']],
    body: summary.sourceBreakdown.map((s) => [
      SOURCE_LABEL[s.source] ?? s.source,
      String(s.count),
      money(s.revenue),
      `${s.pct}%`,
    ]),
    headStyles: { fillColor: TEAL, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    styles: { cellPadding: 5 },
  })

  if (summary.corporateClients.length > 0) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 18,
      margin: { left: margin, right: margin },
      head: [['Corporate / group client', 'Purpose', 'Status', 'Total', 'Paid', 'Balance']],
      body: summary.corporateClients.map((c) => [
        c.company_name,
        c.purpose ?? '—',
        c.status,
        money(c.total_amount),
        money(c.amount_paid),
        money(Number(c.total_amount) - Number(c.amount_paid)),
      ]),
      headStyles: { fillColor: TEAL, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      styles: { cellPadding: 5 },
    })
  }

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 18,
    margin: { left: margin, right: margin },
    head: [['Operations summary', 'Value']],
    body: [
      ['Maintenance tickets opened', String(summary.ticketsOpened)],
      ['Maintenance tickets resolved', String(summary.ticketsResolved)],
      ['Maintenance tickets still open', String(summary.ticketsStillOpen)],
      ['Shift handovers logged', String(summary.handovers.length)],
      ['Shift handovers with a mismatch', String(summary.handoverMismatches.length)],
      ['Net cash mismatch', money(summary.totalMismatchAmount)],
    ],
    headStyles: { fillColor: INK, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    styles: { cellPadding: 5 },
  })

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...INK3)
    doc.text(
      `HotelIQ · ${summary.hotelName} · ${monthLabel(summary.start)} · Page ${i} of ${pageCount}`,
      margin,
      doc.internal.pageSize.getHeight() - 20,
    )
  }

  const filenameMonth = new Date(summary.start).toISOString().slice(0, 7)
  doc.save(`${summary.hotelName.replace(/[^a-z0-9]+/gi, '-')}-report-${filenameMonth}.pdf`)
}
