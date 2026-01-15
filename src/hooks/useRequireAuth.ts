import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { APP_CONFIG } from '@/config/app'
import type { UserRole } from '@/types'

interface UseRequireAuthReturn {
  isAuthenticated: boolean
  role: UserRole | null
  hasRole: (roles: UserRole[]) => boolean
  requireAuth: <T extends (...args: unknown[]) => unknown>(callback: T) => (...args: Parameters<T>) => ReturnType<T> | void
  requireRole: <T extends (...args: unknown[]) => unknown>(callback: T, roles: UserRole[]) => (...args: Parameters<T>) => ReturnType<T> | void
  checkAuthAndRedirect: () => boolean
  checkRoleAndRedirect: (roles: UserRole[]) => boolean
}

/**
 * Hook for action-level authentication and role checks.
 * Allows users to browse the app freely but redirects to login
 * when they try to perform an action that requires authentication,
 * or to unauthorized page when they lack required roles.
 */
export function useRequireAuth(): UseRequireAuthReturn {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, role } = useAuthStore()

  // Skip auth check if SKIP_AUTH is enabled
  const effectivelyAuthenticated = APP_CONFIG.SKIP_AUTH || isAuthenticated

  /**
   * Check if user has one of the specified roles.
   */
  const hasRole = useCallback((roles: UserRole[]): boolean => {
    return role !== null && roles.includes(role)
  }, [role])

  /**
   * Check if user is authenticated and redirect to login if not.
   * Returns true if authenticated, false if redirected.
   */
  const checkAuthAndRedirect = useCallback((): boolean => {
    if (!effectivelyAuthenticated) {
      navigate('/auth/login', {
        state: { from: location },
        replace: false
      })
      return false
    }
    return true
  }, [effectivelyAuthenticated, navigate, location])

  /**
   * Check if user has required role and redirect appropriately.
   * Returns true if authorized, false if redirected.
   */
  const checkRoleAndRedirect = useCallback((roles: UserRole[]): boolean => {
    if (!effectivelyAuthenticated) {
      navigate('/auth/login', {
        state: { from: location },
        replace: false
      })
      return false
    }
    if (!role || !roles.includes(role)) {
      navigate('/unauthorized', { replace: false })
      return false
    }
    return true
  }, [effectivelyAuthenticated, role, navigate, location])

  /**
   * Wraps a callback function with an authentication check.
   * If user is not authenticated, redirects to login instead of executing the callback.
   */
  const requireAuth = useCallback(<T extends (...args: unknown[]) => unknown>(
    callback: T
  ) => {
    return (...args: Parameters<T>): ReturnType<T> | void => {
      if (!effectivelyAuthenticated) {
        navigate('/auth/login', {
          state: { from: location },
          replace: false
        })
        return
      }
      return callback(...args) as ReturnType<T>
    }
  }, [effectivelyAuthenticated, navigate, location])

  /**
   * Wraps a callback function with a role check.
   * If user is not authenticated, redirects to login.
   * If user lacks required role, redirects to unauthorized page.
   */
  const requireRole = useCallback(<T extends (...args: unknown[]) => unknown>(
    callback: T,
    roles: UserRole[]
  ) => {
    return (...args: Parameters<T>): ReturnType<T> | void => {
      if (!checkRoleAndRedirect(roles)) return
      return callback(...args) as ReturnType<T>
    }
  }, [checkRoleAndRedirect])

  return {
    isAuthenticated: effectivelyAuthenticated,
    role,
    hasRole,
    requireAuth,
    requireRole,
    checkAuthAndRedirect,
    checkRoleAndRedirect,
  }
}
