import { useTenant } from '../../context/TenantContext'
import { useRooms } from '../../hooks/useRooms'
import { useTodayBookings } from '../../hooks/useBookings'
import { useShiftHandovers } from '../../hooks/useShiftHandovers'
import { useMaintenanceTickets } from '../../hooks/useMaintenanceTickets'
import { useCorporateClients } from '../../hooks/useCorporateClients'
import ArrivalsDepartures from '../../components/frontdesk/ArrivalsDepartures'
import RoomGrid from '../../components/frontdesk/RoomGrid'
import QuickBookingForm from '../../components/frontdesk/QuickBookingForm'
import ReconciliationWidget from '../../components/frontdesk/ReconciliationWidget'

export default function FrontDeskDashboard() {
  const { hotel, staffId } = useTenant()
  const { rooms, loading: roomsLoading, updateRoomStatus } = useRooms(hotel?.id)
  const { arrivals, departures, loading: bookingsLoading, refetch: refetchBookings } = useTodayBookings(hotel?.id)
  const { handovers, createHandover } = useShiftHandovers(hotel?.id)
  const { createTicket } = useMaintenanceTickets(hotel?.id)
  const { clients: corporateClients } = useCorporateClients(hotel?.id)
  const bookableClients = corporateClients.filter((c) => c.status === 'inquiry' || c.status === 'confirmed')

  return (
    <div className="flex flex-col gap-4">
      <ArrivalsDepartures arrivals={arrivals} departures={departures} loading={bookingsLoading} />

      <RoomGrid
        rooms={rooms}
        loading={roomsLoading}
        onUpdateStatus={updateRoomStatus}
        onCreateTicket={(roomId, description) => createTicket(roomId, description, staffId)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <QuickBookingForm
          hotelId={hotel?.id}
          rooms={rooms}
          corporateClients={bookableClients}
          onCreated={refetchBookings}
          onUpdateRoomStatus={updateRoomStatus}
        />
        <ReconciliationWidget
          hotelId={hotel?.id}
          staffId={staffId}
          handovers={handovers}
          onCreate={createHandover}
        />
      </div>
    </div>
  )
}
