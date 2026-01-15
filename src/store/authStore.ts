import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User as FirebaseUser } from 'firebase/auth'
import type { UserProfile, UserRole } from '@/types'

interface AuthState {
  user: FirebaseUser | null
  profile: UserProfile | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Role helpers
  isCustomer: boolean
  isDriver: boolean
  isMerchant: boolean
  isAdmin: boolean

  // Actions
  setUser: (user: FirebaseUser | null) => void
  setProfile: (profile: UserProfile | null) => void
  setRole: (role: UserRole | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      role: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      // Role helpers - computed from role
      isCustomer: false,
      isDriver: false,
      isMerchant: false,
      isAdmin: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setProfile: (profile) =>
        set({ profile }),

      setRole: (role) =>
        set({
          role,
          isCustomer: role === 'customer',
          isDriver: role === 'driver',
          isMerchant: role === 'merchant',
          isAdmin: role === 'admin',
        }),

      setLoading: (isLoading) =>
        set({ isLoading }),

      setError: (error) =>
        set({ error, isLoading: false }),

      logout: () => {
        // Clear persisted auth storage to prevent stale data on refresh
        localStorage.removeItem('auth-storage')
        set({
          user: null,
          profile: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          isCustomer: false,
          isDriver: false,
          isMerchant: false,
          isAdmin: false,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        profile: state.profile,
        role: state.role,
      }),
    }
  )
)
