import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from '@/lib/auth'

export function RequireAdminAuth() {
  const { isAuthenticated } = useAdminAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    const redirectTo = `${location.pathname}${location.search}`
    return <Navigate to={`/admin/login?redirectTo=${encodeURIComponent(redirectTo)}`} replace />
  }

  return <Outlet />
}
