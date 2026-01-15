import { create } from 'zustand'
import type { GeoPoint } from 'firebase/firestore'
import type { VehicleType, RideStatus, Driver, RideFare, RouteInfo } from '@/types'

interface LocationInfo {
  address: string
  coordinates: GeoPoint | null
  details?: string
}

export interface PromoCodeInfo {
  code: string
  type: 'percentage' | 'fixed' | 'freeDelivery'
  value: number
  maxDiscount?: number
}

interface RideState {
  // Booking state
  pickup: LocationInfo | null
  dropoff: LocationInfo | null
  vehicleType: VehicleType
  route: RouteInfo | null
  fare: RideFare | null
  paymentMethod: 'cash' | 'gcash' | 'wallet'

  // Scheduled ride
  isScheduled: boolean
  scheduledTime: Date | null

  // Promo and surge
  promoCode: PromoCodeInfo | null
  surgeMultiplier: number

  // Active ride state
  activeRideId: string | null
  rideStatus: RideStatus | null
  driver: Driver | null

  // UI state
  isBooking: boolean
  isFindingDriver: boolean
  error: string | null

  // Actions
  setPickup: (location: LocationInfo | null) => void
  setDropoff: (location: LocationInfo | null) => void
  setVehicleType: (type: VehicleType) => void
  setRoute: (route: RouteInfo | null) => void
  setFare: (fare: RideFare | null) => void
  setPaymentMethod: (method: 'cash' | 'gcash' | 'wallet') => void
  setScheduledRide: (isScheduled: boolean, scheduledTime: Date | null) => void
  setPromoCode: (promo: PromoCodeInfo | null) => void
  setSurgeMultiplier: (multiplier: number) => void
  setActiveRide: (rideId: string | null, status: RideStatus | null) => void
  setDriver: (driver: Driver | null) => void
  setBooking: (isBooking: boolean) => void
  setFindingDriver: (isFinding: boolean) => void
  setError: (error: string | null) => void
  resetBooking: () => void
  resetRide: () => void
}

const initialState = {
  pickup: null,
  dropoff: null,
  vehicleType: 'motorcycle' as VehicleType,
  route: null,
  fare: null,
  paymentMethod: 'cash' as const,
  isScheduled: false,
  scheduledTime: null as Date | null,
  promoCode: null as PromoCodeInfo | null,
  surgeMultiplier: 1,
  activeRideId: null,
  rideStatus: null,
  driver: null,
  isBooking: false,
  isFindingDriver: false,
  error: null,
}

export const useRideStore = create<RideState>((set) => ({
  ...initialState,

  setPickup: (pickup) => set({ pickup }),

  setDropoff: (dropoff) => set({ dropoff }),

  setVehicleType: (vehicleType) => set({ vehicleType }),

  setRoute: (route) => set({ route }),

  setFare: (fare) => set({ fare }),

  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

  setScheduledRide: (isScheduled, scheduledTime) => set({ isScheduled, scheduledTime }),

  setPromoCode: (promoCode) => set({ promoCode }),

  setSurgeMultiplier: (surgeMultiplier) => set({ surgeMultiplier }),

  setActiveRide: (activeRideId, rideStatus) =>
    set({ activeRideId, rideStatus }),

  setDriver: (driver) => set({ driver }),

  setBooking: (isBooking) => set({ isBooking }),

  setFindingDriver: (isFindingDriver) => set({ isFindingDriver }),

  setError: (error) => set({ error }),

  resetBooking: () =>
    set({
      pickup: null,
      dropoff: null,
      vehicleType: 'motorcycle',
      route: null,
      fare: null,
      paymentMethod: 'cash',
      isScheduled: false,
      scheduledTime: null,
      promoCode: null,
      surgeMultiplier: 1,
      isBooking: false,
      error: null,
    }),

  resetRide: () => set(initialState),
}))
