import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useTenant } from '../context/TenantContext'
import { ROLE_HOME_PATH } from '../lib/roles'

const DASHBOARD_IMPORTS = {
  front_desk: () => import('./FrontDesk/FrontDeskDashboard'),
  general_manager: () => import('./GeneralManager/GMDashboard'),
  owner: () => import('./Owner/OwnerDashboard'),
}

// Warms the chunk cache for dashboards the user *isn't* on yet, once the
// browser is idle — so switching role/hotel later (multi-hotel owners/GMs)
// doesn't pay a chunk-download wait.
function prefetchOtherDashboards(currentRole) {
  const run = () => {
    for (const [role, load] of Object.entries(DASHBOARD_IMPORTS)) {
      if (role !== currentRole) load()
    }
  }
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(run)
  } else {
    setTimeout(run, 200)
  }
}

export default function RoleHome() {
  const { role } = useTenant()

  useEffect(() => {
    if (role) prefetchOtherDashboards(role)
  }, [role])

  return <Navigate to={ROLE_HOME_PATH[role] ?? '/login'} replace />
}
