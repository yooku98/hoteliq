import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTenant } from '../../context/TenantContext'
import { ROLE_HOME_PATH } from '../../lib/roles'

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading: authLoading } = useAuth()
  const { role, loading: tenantLoading, activeMembership } = useTenant()

  if (authLoading || (user && tenantLoading)) {
    return <div className="min-h-screen bg-surface flex items-center justify-center text-ink3 text-sm">Loading…</div>
  }

  if (!user) return <Navigate to="/login" replace />

  if (!activeMembership) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-ink3 text-sm">
        Your account isn't linked to a hotel yet. Contact your administrator.
      </div>
    )
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={ROLE_HOME_PATH[role] ?? '/login'} replace />
  }

  return children
}
