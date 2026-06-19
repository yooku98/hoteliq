import { useMemo } from 'react'
import { useTenant } from '../../context/TenantContext'
import { useRooms } from '../../hooks/useRooms'
import { useOccupancyRevenue } from '../../hooks/useOccupancyRevenue'
import { useMaintenanceTickets } from '../../hooks/useMaintenanceTickets'
import { useShiftHandovers } from '../../hooks/useShiftHandovers'
import { bookingSourceBreakdown } from '../../lib/analytics'
import LowOccupancyBanner from '../../components/gm/LowOccupancyBanner'
import OccupancyChart from '../../components/gm/OccupancyChart'
import RevenueChart from '../../components/gm/RevenueChart'
import BookingSourceChart from '../../components/gm/BookingSourceChart'
import MaintenanceList from '../../components/gm/MaintenanceList'
import HandoverLog from '../../components/gm/HandoverLog'

export default function GMDashboard() {
  const { hotel } = useTenant()
  const { rooms } = useRooms(hotel?.id)
  const totalRooms = rooms.length

  const past30 = useOccupancyRevenue(hotel?.id, totalRooms, { daysBack: 29, daysForward: 0 })
  const next7 = useOccupancyRevenue(hotel?.id, totalRooms, { daysBack: 0, daysForward: 6 })

  const { tickets, updateTicketStatus } = useMaintenanceTickets(hotel?.id)
  const { handovers } = useShiftHandovers(hotel?.id)

  const sourceBreakdown = useMemo(() => bookingSourceBreakdown(past30.bookings), [past30.bookings])

  return (
    <div className="flex flex-col gap-4">
      <LowOccupancyBanner series={next7.series} />

      <div className="grid grid-cols-2 gap-4">
        <OccupancyChart series={past30.series} loading={past30.loading} />
        <RevenueChart series={past30.series} loading={past30.loading} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MaintenanceList tickets={tickets} onUpdateStatus={updateTicketStatus} />
        <HandoverLog handovers={handovers} />
        <BookingSourceChart breakdown={sourceBreakdown} loading={past30.loading} />
      </div>
    </div>
  )
}
