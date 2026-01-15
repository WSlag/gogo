import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Spinner } from '@/components/ui'
import { APP_CONFIG } from '@/config/app'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireProfile?: boolean
}

export function ProtectedRoute({ children, requireProfile = false }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, isLoading, profile } = useAuthStore()

  // Skip auth check if SKIP_AUTH is enabled (for testing)
  if (APP_CONFIG.SKIP_AUTH) {
    return <>{children}</>
  }

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Redirect to registration if profile is required but not complete
  if (requireProfile && !profile) {
    return <Navigate to="/auth/register" state={{ from: location }} replace />
  }

  return <>{children}</>
}
