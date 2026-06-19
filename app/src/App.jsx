import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TenantProvider } from './context/TenantContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import Login from './pages/Login'
import RoleHome from './pages/RoleHome'

// Each dashboard pulls in Recharts — code-split per route so the chart
// library only loads for the role that needs it.
const FrontDeskDashboard = lazy(() => import('./pages/FrontDesk/FrontDeskDashboard'))
const GMDashboard = lazy(() => import('./pages/GeneralManager/GMDashboard'))
const OwnerDashboard = lazy(() => import('./pages/Owner/OwnerDashboard'))

function PageLoading() {
  return <div className="text-ink3 text-sm py-12 text-center">Loading…</div>
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute allowedRoles={['front_desk', 'general_manager', 'owner']}>
                    <RoleHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/front-desk"
                element={
                  <ProtectedRoute allowedRoles={['front_desk']}>
                    <DashboardLayout>
                      <FrontDeskDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gm"
                element={
                  <ProtectedRoute allowedRoles={['general_manager']}>
                    <DashboardLayout>
                      <GMDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <DashboardLayout>
                      <OwnerDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
