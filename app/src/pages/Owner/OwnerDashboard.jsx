import { useTenant } from '../../context/TenantContext'
import { useRevenueLeakage } from '../../hooks/useRevenueLeakage'
import WeeklyBriefing from '../../components/owner/WeeklyBriefing'
import RevenueLeakage from '../../components/owner/RevenueLeakage'
import GMDashboard from '../GeneralManager/GMDashboard'

// Owner view = everything in the GM view, plus the AI weekly briefing and
// revenue-leakage flag. The property switcher lives in Header (TenantContext)
// and applies automatically since both views key off the active hotel.
export default function OwnerDashboard() {
  const { hotel } = useTenant()
  const { outstanding, totalOutstanding, loading } = useRevenueLeakage(hotel?.id)

  return (
    <div className="flex flex-col gap-4">
      <WeeklyBriefing hotelId={hotel?.id} />
      <RevenueLeakage outstanding={outstanding} totalOutstanding={totalOutstanding} loading={loading} />
      <GMDashboard />
    </div>
  )
}
