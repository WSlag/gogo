import { create } from 'zustand'
import type { GeoPoint } from 'firebase/firestore'

interface UIState {
  // Location
  currentLocation: GeoPoint | null
  locationPermission: 'granted' | 'denied' | 'prompt' | null

  // Loading states
  isAppLoading: boolean
  isLocationLoading: boolean

  // Modals & Sheets
  isLocationPickerOpen: boolean
  isPaymentMethodOpen: boolean
  isPromoCodeOpen: boolean

  // Toast notifications
  toast: {
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
    isVisible: boolean
  } | null

  // Actions
  setCurrentLocation: (location: GeoPoint | null) => void
  setLocationPermission: (permission: 'granted' | 'denied' | 'prompt' | null) => void
  setAppLoading: (loading: boolean) => void
  setLocationLoading: (loading: boolean) => void
  setLocationPickerOpen: (open: boolean) => void
  setPaymentMethodOpen: (open: boolean) => void
  setPromoCodeOpen: (open: boolean) => void
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void
  hideToast: () => void
}

export const useUIStore = create<UIState>((set) => ({
  currentLocation: null,
  locationPermission: null,
  isAppLoading: true,
  isLocationLoading: false,
  isLocationPickerOpen: false,
  isPaymentMethodOpen: false,
  isPromoCodeOpen: false,
  toast: null,

  setCurrentLocation: (currentLocation) => set({ currentLocation }),

  setLocationPermission: (locationPermission) => set({ locationPermission }),

  setAppLoading: (isAppLoading) => set({ isAppLoading }),

  setLocationLoading: (isLocationLoading) => set({ isLocationLoading }),

  setLocationPickerOpen: (isLocationPickerOpen) => set({ isLocationPickerOpen }),

  setPaymentMethodOpen: (isPaymentMethodOpen) => set({ isPaymentMethodOpen }),

  setPromoCodeOpen: (isPromoCodeOpen) => set({ isPromoCodeOpen }),

  showToast: (message, type) =>
    set({
      toast: { message, type, isVisible: true },
    }),

  hideToast: () => set({ toast: null }),
}))
