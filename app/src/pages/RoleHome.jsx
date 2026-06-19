import { Navigate } from 'react-router-dom'
import { useTenant } from '../context/TenantContext'
import { ROLE_HOME_PATH } from '../lib/roles'

// Lands authenticated users on the dashboard for their role.
export default function RoleHome() {
  const { role } = useTenant()
  return <Navigate to={ROLE_HOME_PATH[role] ?? '/login'} replace />
}
