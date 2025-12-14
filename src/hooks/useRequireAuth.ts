import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface UseRequireAuthReturn {
  isAuthenticated: boolean
  requireAuth: <T extends (...args: unknown[]) => unknown>(callback: T) => (...args: Parameters<T>) => ReturnType<T> | void
  checkAuthAndRedirect: () => boolean
}

/**
 * Hook for action-level authentication checks.
 * Allows users to browse the app freely but redirects to login
 * when they try to perform an action that requires authentication.
 */
export function useRequireAuth(): UseRequireAuthReturn {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()

  /**
   * Check if user is authenticated and redirect to login if not.
   * Returns true if authenticated, false if redirected.
   */
  const checkAuthAndRedirect = useCallback((): boolean => {
    if (!isAuthenticated) {
      navigate('/auth/login', {
        state: { from: location },
        replace: false
      })
      return false
    }
    return true
  }, [isAuthenticated, navigate, location])

  /**
   * Wraps a callback function with an authentication check.
   * If user is not authenticated, redirects to login instead of executing the callback.
   */
  const requireAuth = useCallback(<T extends (...args: unknown[]) => unknown>(
    callback: T
  ) => {
    return (...args: Parameters<T>): ReturnType<T> | void => {
      if (!isAuthenticated) {
        navigate('/auth/login', {
          state: { from: location },
          replace: false
        })
        return
      }
      return callback(...args) as ReturnType<T>
    }
  }, [isAuthenticated, navigate, location])

  return {
    isAuthenticated,
    requireAuth,
    checkAuthAndRedirect,
  }
}
